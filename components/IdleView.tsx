export default function IdleView() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Decorative center micro icon mimicking layout blueprint structure */}
      <div className="w-20 h-24 rounded-2xl bg-[#161f30]/30 border border-[#1f293d] flex items-center justify-center shadow-2xl opacity-40">
        <span className="text-3xl text-gray-500">🎙️</span>
      </div>
    </div>
  );
}