import { useState, useRef, useEffect } from 'react';

export default function Toolbar({ onCheck, onRevealLetter, onRevealWord, onRevealPuzzle, onRestart }) {
  const [showRevealMenu, setShowRevealMenu] = useState(false);
  const [showCheckMenu, setShowCheckMenu] = useState(false);
  const revealRef = useRef(null);
  const checkRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (revealRef.current && !revealRef.current.contains(e.target)) {
        setShowRevealMenu(false);
      }
      if (checkRef.current && !checkRef.current.contains(e.target)) {
        setShowCheckMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3 text-sm font-sans">
      {/* Check dropdown */}
      <div ref={checkRef} className="relative">
        <button
          onClick={() => { setShowCheckMenu(!showCheckMenu); setShowRevealMenu(false); }}
          className="px-3 py-1.5 text-[#121212] hover:bg-[#f0f0f0] rounded transition-colors cursor-pointer font-medium"
        >
          Check
        </button>
        {showCheckMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-[#ddd] rounded shadow-md z-50 min-w-[140px]">
            <button
              onClick={() => { onCheck('letter'); setShowCheckMenu(false); }}
              className="block w-full text-left px-3 py-2 hover:bg-[#f0f0f0] cursor-pointer text-sm"
            >
              Letter
            </button>
            <button
              onClick={() => { onCheck('word'); setShowCheckMenu(false); }}
              className="block w-full text-left px-3 py-2 hover:bg-[#f0f0f0] cursor-pointer text-sm"
            >
              Word
            </button>
            <button
              onClick={() => { onCheck('puzzle'); setShowCheckMenu(false); }}
              className="block w-full text-left px-3 py-2 hover:bg-[#f0f0f0] cursor-pointer text-sm"
            >
              Puzzle
            </button>
          </div>
        )}
      </div>

      {/* Reveal dropdown */}
      <div ref={revealRef} className="relative">
        <button
          onClick={() => { setShowRevealMenu(!showRevealMenu); setShowCheckMenu(false); }}
          className="px-3 py-1.5 text-[#121212] hover:bg-[#f0f0f0] rounded transition-colors cursor-pointer font-medium"
        >
          Reveal
        </button>
        {showRevealMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-[#ddd] rounded shadow-md z-50 min-w-[140px]">
            <button
              onClick={() => { onRevealLetter(); setShowRevealMenu(false); }}
              className="block w-full text-left px-3 py-2 hover:bg-[#f0f0f0] cursor-pointer text-sm"
            >
              Letter
            </button>
            <button
              onClick={() => { onRevealWord(); setShowRevealMenu(false); }}
              className="block w-full text-left px-3 py-2 hover:bg-[#f0f0f0] cursor-pointer text-sm"
            >
              Word
            </button>
            <button
              onClick={() => { onRevealPuzzle(); setShowRevealMenu(false); }}
              className="block w-full text-left px-3 py-2 hover:bg-[#f0f0f0] cursor-pointer text-sm"
            >
              Puzzle
            </button>
          </div>
        )}
      </div>

      {/* Restart */}
      <button
        onClick={onRestart}
        className="px-3 py-1.5 text-[#121212] hover:bg-[#f0f0f0] rounded transition-colors cursor-pointer font-medium"
      >
        Reset
      </button>
    </div>
  );
}
