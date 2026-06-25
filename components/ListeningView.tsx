"use client";

import type { SessionPhase } from "@/hooks/useGeminiLive";

interface ListeningViewProps {
  phase: SessionPhase;
  audioLevel: number;
  elapsedSeconds: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndSession: () => void;
  onStartTalking: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ListeningView({
  phase,
  audioLevel,
  elapsedSeconds,
  isMuted,
  onToggleMute,
  onEndSession,
  onStartTalking,
}: ListeningViewProps) {
  const isAISpeaking = phase === "ai-speaking";
  const isConnecting = phase === "connecting";
  const isReady = phase === "ready";
  const isListening = phase === "listening";

  const heading = isConnecting
    ? "Connecting to Gemini..."
    : isAISpeaking
      ? "AI is responding..."
      : isReady
        ? "Your turn to speak"
        : "Listening...";

  const subtitle = isConnecting
    ? "Setting up your interview session."
    : isAISpeaking
      ? "The interviewer is giving feedback."
      : isReady
        ? "Press Space or click the button below to respond."
        : "Speak clearly — your response is being captured.";

  const barCount = 11;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const center = (barCount - 1) / 2;
    const dist = Math.abs(i - center) / center;
    const base = isAISpeaking || isReady ? 8 : 4;
    const boost = isReady ? 0 : audioLevel * 40 * (1 - dist * 0.6);
    return Math.max(base, base + boost);
  });

  const glowScale = isReady ? 1 : 1 + audioLevel * 0.5;

  const iconColor = isAISpeaking
    ? "bg-emerald-600 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
    : isReady
      ? "bg-amber-600 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]"
      : "bg-[#2563eb] border-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.4)]";

  const glowColor = isAISpeaking
    ? "rgba(16, 185, 129, 0.2)"
    : isReady
      ? "rgba(245, 158, 11, 0.2)"
      : "rgba(37, 99, 235, 0.2)";

  const barColor = isAISpeaking
    ? "rgba(16, 185, 129, 0.8)"
    : isReady
      ? "rgba(245, 158, 11, 0.4)"
      : "rgba(96, 165, 250, 0.8)";

  return (
    <div className="flex flex-col items-center justify-between h-full w-full py-12 relative">
      <div className="text-center mt-4">
        <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold border-l-2 border-blue-500 pl-2">
          {isConnecting
            ? "Phase 01 / Connecting"
            : isAISpeaking
              ? "Phase 03 / AI Response"
              : isReady
                ? "Phase 02 / Your Turn"
                : "Phase 02 / Active Listening"}
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 my-auto">
        <div className="text-center max-w-md space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">{heading}</h2>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>

        <div className="relative flex items-center justify-center group mt-4">
          <div
            className="absolute inset-0 rounded-2xl transition-all duration-150"
            style={{
              background: glowColor,
              filter: `blur(16px)`,
              transform: `scale(${glowScale})`,
            }}
          />
          <div
            className={`w-16 h-16 border rounded-2xl flex items-center justify-center relative z-10 transition-all duration-150 ${iconColor}`}
          >
            <span className="text-2xl text-white">
              {isAISpeaking ? "🔊" : isReady ? "⌨️" : "🎙️"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 h-8 mt-6">
          {bars.map((height, i) => (
            <span
              key={i}
              className="w-0.75 rounded-full transition-all duration-100"
              style={{
                height: `${height}px`,
                backgroundColor: barColor,
              }}
            />
          ))}
        </div>

        {isReady && (
          <button
            onClick={onStartTalking}
            className="mt-4 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-900/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>🎙️</span> Tap to Speak
            <span className="text-xs opacity-70 ml-1">(or press Space)</span>
          </button>
        )}

        {isMuted && (
          <span className="text-xs text-red-400 font-medium mt-2">Microphone muted</span>
        )}
      </div>

      <div className="w-full max-w-4xl px-4 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-500 bg-[#090d16] px-3 py-1.5 rounded-lg border border-[#1f293d]">
          <span className="text-emerald-400 font-bold">
            {formatTime(elapsedSeconds)}
          </span>
          <span className="opacity-40">/</span>
          <span>15:00</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              isMuted
                ? "bg-red-900/30 border-red-900/40 text-red-400 hover:bg-red-900/50"
                : "bg-[#111622] border-[#1f293d] text-gray-300 hover:bg-[#161f30]"
            }`}
          >
            {isMuted ? "Unmute Mic" : "Mute Mic"}
          </button>
          <button
            onClick={onEndSession}
            className="px-4 py-2 bg-[#1a141a] hover:bg-[#2c1a24] border border-red-900/40 rounded-xl text-xs font-semibold text-red-400 transition-all active:scale-95"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}
