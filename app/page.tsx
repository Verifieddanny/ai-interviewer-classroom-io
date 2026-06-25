"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import IdleView from "@/components/IdleView";
import ListeningView from "@/components/ListeningView";
import { useGeminiLive } from "@/hooks/useGeminiLive";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [candidateName, setCandidateName] = useState("");

  const {
    phase,
    isMuted,
    audioLevel,
    elapsedSeconds,
    startSession,
    endSession,
    toggleMute,
    startTalking,
  } = useGeminiLive({ jobDescription, candidateName });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090e]">
      <Sidebar
        appState={phase}
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        candidateName={candidateName}
        setCandidateName={setCandidateName}
        onStartSession={startSession}
      />

      <div className="flex flex-1 flex-col overflow-hidden bg-[#0d111a]">
        <Header phase={phase} />

        <main className="flex flex-1 flex-col items-center justify-center p-6 relative">
          {phase === "idle" ? (
            <IdleView />
          ) : (
            <ListeningView
              phase={phase}
              audioLevel={audioLevel}
              elapsedSeconds={elapsedSeconds}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onEndSession={endSession}
              onStartTalking={startTalking}
            />
          )}
        </main>
      </div>
    </div>
  );
}
