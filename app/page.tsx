"use main";
"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import IdleView from "@/components/IdleView";
import ListeningView from "@/components/ListeningView";

export type AppState = "idle" | "listening";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [jobDescription, setJobDescription] = useState("");

  const handleStartSession = () => {
    if (appState === "idle") {
      setAppState("listening");
    }
  };

  const handleEndSession = () => {
    setAppState("idle");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090e]">
      {/* Sidebar Navigation */}
      <Sidebar 
        appState={appState} 
        jobDescription={jobDescription} 
        setJobDescription={setJobDescription} 
        onStartSession={handleStartSession}
      />

      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#0d111a]">
        <Header />
        
        <main className="flex flex-1 flex-col items-center justify-center p-6 relative">
          {appState === "idle" ? (
            <IdleView />
          ) : (
            <ListeningView onEndSession={handleEndSession} />
          )}
        </main>
      </div>
    </div>
  );
}