"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export type SessionPhase = "idle" | "connecting" | "listening" | "ai-speaking" | "ready";

interface UseGeminiLiveOptions {
  jobDescription?: string;
  candidateName?: string;
}

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

export function useGeminiLive({ jobDescription, candidateName }: UseGeminiLiveOptions = {}) {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyRef = useRef<Message[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const retryCountRef = useRef(0);
  const autoListenFailedRef = useRef(false);
  const MAX_RETRIES = 3;

  const startTimer = useCallback(() => {
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopAudioMonitor = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const monitorMicLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const val = (data[i] - 128) / 128;
        sum += val * val;
      }
      setAudioLevel(Math.sqrt(sum / data.length));
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) =>
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel")
        );
        if (preferred) utterance.voice = preferred;

        synthesisRef.current = utterance;

        utterance.onend = () => {
          synthesisRef.current = null;
          resolve();
        };
        utterance.onerror = () => {
          synthesisRef.current = null;
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    []
  );

  const callGemini = useCallback(
    async (userText: string): Promise<string> => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing API key");

      historyRef.current.push({
        role: "user",
        parts: [{ text: userText }],
      });

      const name = candidateName?.trim() || "the candidate";
      const roleContext = jobDescription
        ? `The candidate is applying for:\n\n${jobDescription}`
        : `The candidate is applying for a software engineering position.`;

      const systemPrompt = `You are Ruth, a friendly technical interviewer. ${roleContext}

The candidate's name is ${name}.

STRICT RULES — you will be spoken aloud via text-to-speech:
- Maximum 2 sentences per response. No exceptions.
- Ask exactly ONE simple question. Never combine multiple questions.
- No jargon-heavy setups. No "given that X uses Y for Z" preambles.
- After the candidate answers: one short reaction + one new question. That's it.
- First message: "Hi ${name}, I'm Ruth. [one short question]." Nothing more.`;

      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: historyRef.current,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error: ${res.status} - ${err}`);
      }

      const data = await res.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't catch that. Could you repeat?";

      historyRef.current.push({
        role: "model",
        parts: [{ text: reply }],
      });

      return reply;
    },
    [jobDescription, candidateName]
  );

  const handleUserSpeech = useCallback(async (transcript: string) => {
    if (!activeRef.current) return;

    stopAudioMonitor();
    setPhase("ai-speaking");

    try {
      const reply = await callGemini(transcript);
      console.log("AI:", reply);

      if (!activeRef.current) return;
      await speak(reply);

      if (activeRef.current) {
        if (autoListenFailedRef.current) {
          setPhase("ready");
        } else {
          attemptAutoListen();
        }
      }
    } catch (err) {
      console.error("Error:", err);
      if (activeRef.current) {
        setPhase("ready");
      }
    }
  }, [callGemini, speak, stopAudioMonitor]);

  const attemptAutoListen = useCallback(() => {
    if (!activeRef.current) return;

    if (autoListenFailedRef.current) {
      setPhase("ready");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPhase("ready");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    setPhase("listening");
    monitorMicLevel();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      retryCountRef.current = 0;
      const transcript = event.results[0][0].transcript;
      console.log("USER:", transcript);
      handleUserSpeech(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log("Speech recognition error:", event.error, `(retry ${retryCountRef.current}/${MAX_RETRIES})`);

      if (event.error === "no-speech" && activeRef.current) {
        retryCountRef.current++;
        if (retryCountRef.current <= MAX_RETRIES) {
          setTimeout(() => {
            if (activeRef.current) attemptAutoListen();
          }, 500);
          return;
        }
      }

      if (event.error === "network" || event.error === "aborted") {
        console.log("Auto-listen not supported in this browser, switching to press-to-talk.");
        autoListenFailedRef.current = true;
      }

      stopAudioMonitor();
      if (activeRef.current) {
        setPhase("ready");
      }
    };

    recognition.onend = () => {};

    recognition.start();
  }, [monitorMicLevel, stopAudioMonitor, handleUserSpeech]);

  const startTalking = useCallback(() => {
    if (!activeRef.current) return;
    if (phase !== "ready") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    setPhase("listening");
    monitorMicLevel();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      console.log("USER:", transcript);
      handleUserSpeech(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log("Speech recognition error:", event.error);
      stopAudioMonitor();
      if (activeRef.current) {
        setPhase("ready");
      }
    };

    recognition.onend = () => {};

    recognition.start();
  }, [phase, handleUserSpeech, monitorMicLevel, stopAudioMonitor]);

  // Spacebar press-to-talk (only in ready phase)
  useEffect(() => {
    if (phase !== "ready") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && phase === "ready") {
        e.preventDefault();
        startTalking();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, startTalking]);

  const startSession = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing NEXT_PUBLIC_GEMINI_API_KEY");
      return;
    }

    console.log("Starting interview session...");
    setPhase("connecting");
    activeRef.current = true;
    historyRef.current = [];
    retryCountRef.current = 0;
    autoListenFailedRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      window.speechSynthesis.getVoices();

      setPhase("ai-speaking");
      startTimer();

      const greeting = await callGemini(
        "The interview is starting now. Please introduce yourself as the interviewer and ask your first question."
      );
      console.log("AI:", greeting);

      if (!activeRef.current) return;
      await speak(greeting);

      if (activeRef.current) {
        attemptAutoListen();
      }
    } catch (err) {
      console.error("Failed to start session:", err);
      activeRef.current = false;
      setPhase("idle");
    }
  }, [callGemini, speak, attemptAutoListen, startTimer]);

  const endSession = useCallback(() => {
    console.log("Ending session...");
    activeRef.current = false;

    recognitionRef.current?.stop();
    recognitionRef.current = null;

    window.speechSynthesis.cancel();
    synthesisRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    stopAudioMonitor();
    analyserRef.current = null;

    stopTimer();
    historyRef.current = [];
    setPhase("idle");
    setAudioLevel(0);
    setIsMuted(false);
    setElapsedSeconds(0);
  }, [stopTimer, stopAudioMonitor]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (mediaStreamRef.current) {
        const track = mediaStreamRef.current.getAudioTracks()[0];
        if (track) track.enabled = !newMuted;
      }
      return newMuted;
    });
  }, []);

  return {
    phase,
    isMuted,
    audioLevel,
    elapsedSeconds,
    startSession,
    endSession,
    toggleMute,
    startTalking,
  };
}
