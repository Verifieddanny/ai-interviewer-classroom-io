"use client";

import React from "react";

interface SidebarProps {
  appState: "idle" | "listening";
  jobDescription: string;
  setJobDescription: (val: string) => void;
  onStartSession: () => void;
}

export default function Sidebar({ 
  appState, 
  jobDescription, 
  setJobDescription, 
  onStartSession 
}: SidebarProps) {
  
  const navItems = [
    { label: "Sessions", icon: "🕒", active: appState === "listening" },
    { label: "Feedback", icon: "📊", active: false },
    { label: "Library", icon: "📔", active: false },
    { label: "Settings", icon: "⚙️", active: false },
    ...(appState === "idle" ? [{ label: "Job Context", icon: "📄", active: false }] : []),
  ];

  return (
    <aside className="w-65 border-r border-[#1f293d] bg-[#111622] flex flex-col justify-between p-4 z-10">
      <div className="flex flex-col gap-6">
        {/* Branding Header */}
        <div>
          <h1 className="text-lg font-semibold text-gray-200 tracking-wide">Interview Coach</h1>
          <span className="text-xs text-gray-500">v1.0.4</span>
        </div>

        {/* Dynamic Nav List */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full
                ${item.active 
                  ? "bg-[#1e293b] text-white shadow-sm border-l-2 border-blue-500" 
                  : "text-gray-400 hover:bg-[#161f30] hover:text-gray-200"
                }`}
            >
              <span className="text-base leading-none opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conditional Configuration Workspace */}
      <div className="flex flex-col gap-4">
        {appState === "idle" && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Target Role</span>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to give the AI context..."
              className="w-full h-32 p-3 bg-[#090d16] border border-[#1f293d] rounded-xl text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none transition-all"
            />
          </div>
        )}
        
        <button 
          onClick={onStartSession}
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span className="text-xs">▶</span> Start Session
        </button>
      </div>
    </aside>
  );
}