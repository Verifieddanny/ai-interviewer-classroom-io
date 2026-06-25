import type { SessionPhase } from "@/hooks/useGeminiLive";

interface HeaderProps {
  phase: SessionPhase;
}

export default function Header({ phase }: HeaderProps) {
  const statusLabel =
    phase === "idle"
      ? "Gemini Live Engine • Ready"
      : phase === "connecting"
        ? "Connecting..."
        : "Gemini Live Engine • Connected";

  const statusColor =
    phase === "idle"
      ? "bg-gray-500"
      : phase === "connecting"
        ? "bg-amber-400 animate-pulse"
        : "bg-[#10b981] animate-pulse";

  return (
    <header className="h-14 border-b border-[#1f293d] px-6 flex items-center justify-between bg-[#111622]/40 backdrop-blur-md z-10">
      <span className="text-xs uppercase font-medium tracking-widest text-gray-500">
        AI Interview Coach v1.0
      </span>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#090d16] border border-[#1f293d] px-3 py-1.5 rounded-full">
          <span className={`h-2 w-2 rounded-full ${statusColor}`} />
          <span className="text-xs font-medium text-gray-300 tracking-tight">{statusLabel}</span>
        </div>

        <div className="h-7 w-7 rounded-full border border-gray-600 bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-300 cursor-pointer hover:border-gray-400 transition-colors">
          U
        </div>
      </div>
    </header>
  );
}
