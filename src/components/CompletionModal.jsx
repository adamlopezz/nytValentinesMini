export default function CompletionModal({ seconds, onClose }) {
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm mx-4 text-center animate-fade-in-up">
        <div className="text-5xl mb-4">&#9825;</div>
        <h2 className="font-serif text-2xl font-bold text-[#121212] mb-2">
          Happy Valentine's Day
        </h2>
        <p className="font-serif text-lg text-[#e63946] mb-4">
          &#9829; For My Valentine &#9829;
        </p>
        <p className="font-sans text-sm text-[#666] mb-6">
          Completed in {formatTime(seconds)}
        </p>
        <button
          onClick={onClose}
          className="font-sans text-sm px-6 py-2 bg-[#121212] text-white rounded cursor-pointer hover:bg-[#333] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
