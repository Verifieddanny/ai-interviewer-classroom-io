"use client";

interface ListeningViewProps {
  onEndSession: () => void;
}

export default function ListeningView({ onEndSession }: ListeningViewProps) {
  return (
    <div className="flex flex-col items-center justify-between h-full w-full py-12 relative">
      {/* Structural Metadata Tag */}
      <div className="text-center mt-4">
        <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold border-l-2 border-blue-500 pl-2">
          Phase 02 / Active Listening
        </span>
      </div>

      {/* Main Focus Audio Signal Frame */}
      <div className="flex flex-col items-center gap-6 my-auto">
        <div className="text-center max-w-md space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Listening to your response...</h2>
          <p className="text-sm text-gray-400">Focus on articulating your STAR method clearly.</p>
        </div>

        {/* Central Glowing Mic Pulsar */}
        <div className="relative flex items-center justify-center group mt-4">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl scale-125 animate-pulse" />
          <div className="w-16 h-16 bg-[#2563eb] border border-blue-400 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.4)] relative z-10 transition-transform active:scale-95">
            <span className="text-2xl text-white">🎙️</span>
          </div>
        </div>

        {/* Level Meter Visualization */}
        <div className="flex items-center gap-1.5 h-6 mt-6">
          {[4, 8, 14, 10, 16, 12, 18, 10, 14, 6, 4].map((height, i) => (
            <span
              key={i}
              className="w-0.75 bg-blue-400/80 rounded-full animate-bounce"
              style={{
                height: `${height * 1.2}px`,
                animationDelay: `${i * 0.08}s`,
                animationDuration: "1.1s"
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Session Workspace Actions Dashboard */}
      <div className="w-full max-w-4xl px-4 flex items-center justify-between mt-auto">
        {/* Standard Session Stop Watch */}
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-500 bg-[#090d16] px-3 py-1.5 rounded-lg border border-[#1f293d]">
          <span className="text-emerald-400 font-bold animate-pulse">02:45</span>
          <span className="opacity-40">/</span>
          <span>15:00</span>
        </div>

        {/* Primary Controls Group */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#111622] hover:bg-[#161f30] border border-[#1f293d] rounded-xl text-xs font-semibold text-gray-300 transition-all active:scale-95">
            Mute Mic
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