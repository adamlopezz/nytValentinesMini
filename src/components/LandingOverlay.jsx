export default function LandingOverlay({ onPlay }) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center px-6 max-w-md w-full">
        {/* Mini crossword icon */}
        <div className="mb-6 flex justify-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="4" y="4" width="56" height="56" rx="4" stroke="#121212" strokeWidth="3" />
            {/* 3x3 grid pattern */}
            <rect x="8" y="8" width="16" height="16" fill="#121212" />
            <rect x="24" y="8" width="16" height="16" fill="#fff" stroke="#121212" strokeWidth="1" />
            <rect x="40" y="8" width="16" height="16" fill="#121212" />
            <rect x="8" y="24" width="16" height="16" fill="#fff" stroke="#121212" strokeWidth="1" />
            <rect x="24" y="24" width="16" height="16" fill="#121212" />
            <rect x="40" y="24" width="16" height="16" fill="#fff" stroke="#121212" strokeWidth="1" />
            <rect x="8" y="40" width="16" height="16" fill="#fff" stroke="#121212" strokeWidth="1" />
            <rect x="24" y="40" width="16" height="16" fill="#fff" stroke="#121212" strokeWidth="1" />
            <rect x="40" y="40" width="16" height="16" fill="#121212" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="font-serif font-black text-[#121212] leading-none mb-3"
          style={{ fontSize: 'clamp(36px, 8vw, 52px)' }}
        >
          The Crossword
        </h1>

        {/* Subtitle */}
        <p
          className="font-serif text-[#121212] mb-10"
          style={{ fontSize: 'clamp(18px, 4vw, 26px)' }}
        >
          Ready to start solving?
        </p>

        {/* Play button */}
        <button
          onClick={onPlay}
          className="mx-auto block w-full max-w-xs py-4 px-8 bg-[#121212] text-white font-sans font-medium text-lg rounded-full cursor-pointer hover:bg-[#333] transition-colors"
        >
          Play
        </button>

        {/* Date and author */}
        <div className="mt-8">
          <p className="font-sans font-bold text-sm text-[#121212]">
            Saturday, February 14, 2026
          </p>
          <p className="font-sans text-sm text-[#666] mt-0.5">
            By Adam Lopez
          </p>
        </div>
      </div>
    </div>
  );
}
