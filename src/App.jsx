import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ROWS,
  COLS,
  acrossClues,
  downClues,
  buildGrid,
  getClueCells,
} from './puzzleData';
import CrosswordGrid from './components/CrosswordGrid';
import ClueList from './components/ClueList';
import Toolbar from './components/Toolbar';
import { TimerDisplay } from './components/Timer';
import CompletionModal from './components/CompletionModal';
import LandingOverlay from './components/LandingOverlay';

const STORAGE_KEY = 'valentine-crossword-state';

function createEmptyInput() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(''));
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function App() {
  const grid = useRef(buildGrid()).current;
  const hiddenInputRef = useRef(null);

  // Find first across clue cell
  const findFirstCell = () => {
    if (acrossClues.length > 0) {
      const first = acrossClues[0];
      return { row: first.row, col: first.col };
    }
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c]) return { row: r, col: c };
      }
    }
    return { row: 0, col: 0 };
  };

  const getClueForCell = (r, c, dir) => {
    const cell = grid[r]?.[c];
    if (!cell) return null;
    return dir === 'A' ? cell.acrossClue : cell.downClue;
  };

  const savedRef = useRef(loadState());

  const [userInput, setUserInput] = useState(() => {
    return savedRef.current?.userInput || createEmptyInput();
  });
  const [activeCell, setActiveCell] = useState(() => {
    return savedRef.current?.activeCell || findFirstCell();
  });
  const [activeDir, setActiveDir] = useState(() => {
    return savedRef.current?.activeDir || 'A';
  });
  const [activeClue, setActiveClue] = useState(() => {
    if (savedRef.current?.activeClue) return savedRef.current.activeClue;
    const first = findFirstCell();
    const cell = grid[first.row]?.[first.col];
    return cell?.acrossClue || cell?.downClue || null;
  });
  const [incorrectCells, setIncorrectCells] = useState(new Set());
  const [revealedCells, setRevealedCells] = useState(() => {
    return new Set(savedRef.current?.revealedCells || []);
  });
  const [isComplete, setIsComplete] = useState(() => {
    return savedRef.current?.isComplete || false;
  });
  const [showModal, setShowModal] = useState(false);
  const [seconds, setSeconds] = useState(() => {
    return savedRef.current?.seconds || 0;
  });
  const [isPaused, setIsPaused] = useState(false);
  const [showLanding, setShowLanding] = useState(() => {
    // Show landing if no saved progress
    return !savedRef.current?.userInput;
  });
  const [completedClues, setCompletedClues] = useState(() => {
    return new Set(savedRef.current?.completedClues || []);
  });

  // Timer
  useEffect(() => {
    if (isComplete || isPaused || showLanding) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isComplete, isPaused, showLanding]);

  // Focus hidden input when active cell changes
  useEffect(() => {
    if (activeCell && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [activeCell]);

  // Save state
  useEffect(() => {
    saveState({
      userInput,
      activeCell,
      activeDir,
      activeClue,
      revealedCells: [...revealedCells],
      isComplete,
      seconds,
      completedClues: [...completedClues],
    });
  }, [userInput, activeCell, activeDir, activeClue, revealedCells, isComplete, seconds, completedClues]);

  // Check completion
  const checkCompletion = useCallback(
    (input) => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c] && input[r][c] !== grid[r][c].letter) {
            return false;
          }
        }
      }
      return true;
    },
    [grid]
  );

  // Update completed clues
  const updateCompletedClues = useCallback(
    (input) => {
      const completed = new Set();
      const allClues = [
        ...acrossClues.map((c) => ({ ...c, dir: 'A' })),
        ...downClues.map((c) => ({ ...c, dir: 'D' })),
      ];
      for (const clue of allClues) {
        const cells = getClueCells(clue.number, clue.dir);
        const isWordComplete = cells.every(
          ({ row, col }) => input[row][col] === grid[row][col].letter
        );
        if (isWordComplete) {
          completed.add(`${clue.dir}-${clue.number}`);
        }
      }
      setCompletedClues(completed);
    },
    [grid]
  );

  // Find next empty cell in direction
  const findNextEmptyCell = useCallback(
    (startRow, startCol, dir, input, forward = true) => {
      if (activeClue === null) return null;
      const cells = getClueCells(activeClue, dir);
      const currentIdx = cells.findIndex(
        (c) => c.row === startRow && c.col === startCol
      );
      if (currentIdx === -1) return null;

      const step = forward ? 1 : -1;
      // First look for empty cells
      for (
        let i = currentIdx + step;
        i >= 0 && i < cells.length;
        i += step
      ) {
        if (!input[cells[i].row][cells[i].col]) {
          return cells[i];
        }
      }
      // If no empty cell found, move to next cell
      const nextIdx = currentIdx + step;
      if (nextIdx >= 0 && nextIdx < cells.length) {
        return cells[nextIdx];
      }
      return null;
    },
    [activeClue]
  );

  // Move to next clue
  const moveToNextClue = useCallback(
    (currentDir, currentClue) => {
      const clues = currentDir === 'A' ? acrossClues : downClues;
      const idx = clues.findIndex((c) => c.number === currentClue);
      if (idx < clues.length - 1) {
        const next = clues[idx + 1];
        return { clue: next.number, row: next.row, col: next.col, dir: currentDir };
      }
      // Switch direction
      const otherDir = currentDir === 'A' ? 'D' : 'A';
      const otherClues = otherDir === 'A' ? acrossClues : downClues;
      if (otherClues.length > 0) {
        const next = otherClues[0];
        return { clue: next.number, row: next.row, col: next.col, dir: otherDir };
      }
      return null;
    },
    []
  );

  // Cell click handler
  const handleCellClick = useCallback(
    (r, c) => {
      const cell = grid[r]?.[c];
      if (!cell) return;

      if (activeCell?.row === r && activeCell?.col === c) {
        // Toggle direction on same cell
        const newDir = activeDir === 'A' ? 'D' : 'A';
        const newClue = getClueForCell(r, c, newDir);
        if (newClue !== null && newClue !== undefined) {
          setActiveDir(newDir);
          setActiveClue(newClue);
        }
      } else {
        setActiveCell({ row: r, col: c });
        // Prefer current direction
        const clue = getClueForCell(r, c, activeDir);
        if (clue !== null && clue !== undefined) {
          setActiveClue(clue);
        } else {
          const otherDir = activeDir === 'A' ? 'D' : 'A';
          const otherClue = getClueForCell(r, c, otherDir);
          if (otherClue !== null && otherClue !== undefined) {
            setActiveDir(otherDir);
            setActiveClue(otherClue);
          }
        }
      }
    },
    [activeCell, activeDir, grid]
  );

  // Clue click handler
  const handleClueClick = useCallback(
    (number, dir) => {
      const clues = dir === 'A' ? acrossClues : downClues;
      const clue = clues.find((c) => c.number === number);
      if (!clue) return;

      setActiveDir(dir);
      setActiveClue(number);

      // Find first empty cell in this clue, or first cell
      const cells = getClueCells(number, dir);
      const firstEmpty = cells.find(({ row, col }) => !userInput[row][col]);
      const target = firstEmpty || cells[0];
      if (target) {
        setActiveCell(target);
      }
    },
    [userInput]
  );

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e) => {
      if (isComplete) return;
      if (!activeCell) return;

      const { row, col } = activeCell;
      const cell = grid[row]?.[col];
      if (!cell) return;

      // Letter input
      if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();
        const newInput = userInput.map((r) => [...r]);
        newInput[row][col] = letter;
        setUserInput(newInput);
        setIncorrectCells((prev) => {
          const next = new Set(prev);
          next.delete(`${row},${col}`);
          return next;
        });

        // Check if puzzle is complete
        if (checkCompletion(newInput)) {
          setIsComplete(true);
          setShowModal(true);
          updateCompletedClues(newInput);
          // Fire confetti
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#e63946', '#ff6b81', '#f7da21', '#a7d8ff', '#fff'],
          });
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 120,
              origin: { y: 0.5 },
              colors: ['#e63946', '#ff6b81', '#f7da21', '#a7d8ff', '#fff'],
            });
          }, 300);
          return;
        }

        updateCompletedClues(newInput);

        // Move to next empty cell
        const next = findNextEmptyCell(row, col, activeDir, newInput, true);
        if (next) {
          setActiveCell(next);
        } else {
          // Move to next cell even if filled
          const cells = getClueCells(activeClue, activeDir);
          const currentIdx = cells.findIndex(
            (c) => c.row === row && c.col === col
          );
          if (currentIdx < cells.length - 1) {
            setActiveCell(cells[currentIdx + 1]);
          }
        }
        return;
      }

      // Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (userInput[row][col]) {
          const newInput = userInput.map((r) => [...r]);
          newInput[row][col] = '';
          setUserInput(newInput);
          setIncorrectCells((prev) => {
            const next = new Set(prev);
            next.delete(`${row},${col}`);
            return next;
          });
          updateCompletedClues(newInput);
        } else {
          // Move backward
          const prev = findNextEmptyCell(row, col, activeDir, userInput, false);
          if (prev) {
            setActiveCell(prev);
            // Also delete that cell
            const newInput = userInput.map((r) => [...r]);
            newInput[prev.row][prev.col] = '';
            setUserInput(newInput);
            updateCompletedClues(newInput);
          } else {
            // Just move to previous cell
            const cells = getClueCells(activeClue, activeDir);
            const currentIdx = cells.findIndex(
              (c) => c.row === row && c.col === col
            );
            if (currentIdx > 0) {
              setActiveCell(cells[currentIdx - 1]);
              const newInput = userInput.map((r) => [...r]);
              newInput[cells[currentIdx - 1].row][cells[currentIdx - 1].col] = '';
              setUserInput(newInput);
              updateCompletedClues(newInput);
            }
          }
        }
        return;
      }

      // Delete
      if (e.key === 'Delete') {
        e.preventDefault();
        const newInput = userInput.map((r) => [...r]);
        newInput[row][col] = '';
        setUserInput(newInput);
        setIncorrectCells((prev) => {
          const next = new Set(prev);
          next.delete(`${row},${col}`);
          return next;
        });
        updateCompletedClues(newInput);
        return;
      }

      // Arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let newRow = row;
        let newCol = col;

        // If arrow matches current direction, move within word
        // If perpendicular, switch direction
        if (e.key === 'ArrowRight') {
          if (activeDir === 'A') {
            newCol = col + 1;
          } else {
            setActiveDir('A');
            const clue = getClueForCell(row, col, 'A');
            if (clue !== null && clue !== undefined) setActiveClue(clue);
            return;
          }
        } else if (e.key === 'ArrowLeft') {
          if (activeDir === 'A') {
            newCol = col - 1;
          } else {
            setActiveDir('A');
            const clue = getClueForCell(row, col, 'A');
            if (clue !== null && clue !== undefined) setActiveClue(clue);
            return;
          }
        } else if (e.key === 'ArrowDown') {
          if (activeDir === 'D') {
            newRow = row + 1;
          } else {
            setActiveDir('D');
            const clue = getClueForCell(row, col, 'D');
            if (clue !== null && clue !== undefined) setActiveClue(clue);
            return;
          }
        } else if (e.key === 'ArrowUp') {
          if (activeDir === 'D') {
            newRow = row - 1;
          } else {
            setActiveDir('D');
            const clue = getClueForCell(row, col, 'D');
            if (clue !== null && clue !== undefined) setActiveClue(clue);
            return;
          }
        }

        // Find next valid cell in direction
        while (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          !grid[newRow]?.[newCol]
        ) {
          if (e.key === 'ArrowRight') newCol++;
          else if (e.key === 'ArrowLeft') newCol--;
          else if (e.key === 'ArrowDown') newRow++;
          else if (e.key === 'ArrowUp') newRow--;
        }

        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          grid[newRow]?.[newCol]
        ) {
          setActiveCell({ row: newRow, col: newCol });
          const clue = getClueForCell(newRow, newCol, activeDir);
          if (clue !== null && clue !== undefined) {
            setActiveClue(clue);
          } else {
            const otherDir = activeDir === 'A' ? 'D' : 'A';
            const otherClue = getClueForCell(newRow, newCol, otherDir);
            if (otherClue !== null && otherClue !== undefined) {
              setActiveDir(otherDir);
              setActiveClue(otherClue);
            }
          }
        }
        return;
      }

      // Tab - switch direction or move to next clue
      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          // Previous clue
          const clues = activeDir === 'A' ? acrossClues : downClues;
          const idx = clues.findIndex((c) => c.number === activeClue);
          if (idx > 0) {
            const prev = clues[idx - 1];
            setActiveClue(prev.number);
            setActiveCell({ row: prev.row, col: prev.col });
          } else {
            // Switch to other direction's last clue
            const otherDir = activeDir === 'A' ? 'D' : 'A';
            const otherClues = otherDir === 'A' ? acrossClues : downClues;
            if (otherClues.length > 0) {
              const last = otherClues[otherClues.length - 1];
              setActiveDir(otherDir);
              setActiveClue(last.number);
              setActiveCell({ row: last.row, col: last.col });
            }
          }
        } else {
          const next = moveToNextClue(activeDir, activeClue);
          if (next) {
            setActiveDir(next.dir);
            setActiveClue(next.clue);
            setActiveCell({ row: next.row, col: next.col });
          }
        }
        return;
      }

      // Space - toggle direction
      if (e.key === ' ') {
        e.preventDefault();
        const newDir = activeDir === 'A' ? 'D' : 'A';
        const clue = getClueForCell(row, col, newDir);
        if (clue !== null && clue !== undefined) {
          setActiveDir(newDir);
          setActiveClue(clue);
        }
      }
    },
    [
      activeCell,
      activeDir,
      activeClue,
      userInput,
      grid,
      isComplete,
      checkCompletion,
      findNextEmptyCell,
      moveToNextClue,
      updateCompletedClues,
    ]
  );

  // Mobile input handler
  const handleMobileInput = useCallback(
    (e) => {
      const ne = e.nativeEvent || {};

      // Handle deletions (Backspace) from mobile keyboards
      if (ne.inputType === 'deleteContentBackward' || ne.inputType === 'deleteByCut') {
        const syntheticEvent = { key: 'Backspace', preventDefault: () => {} };
        handleKeyDown(syntheticEvent);
        e.target.value = '';
        return;
      }

      // Handle inserted characters
      const data = ne.data ?? e.target.value;
      if (!data) {
        e.target.value = '';
        return;
      }

      // If multiple characters pasted, process the last one
      const char = typeof data === 'string' ? data[data.length - 1] : null;
      if (char && /[a-zA-Z0-9]/.test(char)) {
        const syntheticEvent = { key: char, preventDefault: () => {} };
        handleKeyDown(syntheticEvent);
      }

      // Clear the input so next key press is captured fresh
      e.target.value = '';
    },
    [handleKeyDown]
  );

  // Check handler
  const handleCheck = useCallback(
    (scope) => {
      const newIncorrect = new Set();

      if (scope === 'letter') {
        const { row, col } = activeCell;
        const cell = grid[row]?.[col];
        if (cell && userInput[row][col] && userInput[row][col] !== cell.letter) {
          newIncorrect.add(`${row},${col}`);
        }
      } else if (scope === 'word') {
        const cells = getClueCells(activeClue, activeDir);
        for (const { row, col } of cells) {
          const cell = grid[row]?.[col];
          if (cell && userInput[row][col] && userInput[row][col] !== cell.letter) {
            newIncorrect.add(`${row},${col}`);
          }
        }
      } else if (scope === 'puzzle') {
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const cell = grid[r]?.[c];
            if (cell && userInput[r][c] && userInput[r][c] !== cell.letter) {
              newIncorrect.add(`${r},${c}`);
            }
          }
        }
      }

      setIncorrectCells(newIncorrect);

      // Clear incorrect markers after animation
      setTimeout(() => {
        setIncorrectCells(new Set());
      }, 1500);
    },
    [activeCell, activeClue, activeDir, userInput, grid]
  );

  // Reveal handlers
  const handleRevealLetter = useCallback(() => {
    const { row, col } = activeCell;
    const cell = grid[row]?.[col];
    if (!cell) return;

    const newInput = userInput.map((r) => [...r]);
    newInput[row][col] = cell.letter;
    setUserInput(newInput);
    setRevealedCells((prev) => new Set([...prev, `${row},${col}`]));
    updateCompletedClues(newInput);

    if (checkCompletion(newInput)) {
      setIsComplete(true);
      setShowModal(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  }, [activeCell, grid, userInput, checkCompletion, updateCompletedClues]);

  const handleRevealWord = useCallback(() => {
    const cells = getClueCells(activeClue, activeDir);
    const newInput = userInput.map((r) => [...r]);
    const newRevealed = new Set(revealedCells);

    for (const { row, col } of cells) {
      const cell = grid[row]?.[col];
      if (cell) {
        newInput[row][col] = cell.letter;
        newRevealed.add(`${row},${col}`);
      }
    }

    setUserInput(newInput);
    setRevealedCells(newRevealed);
    updateCompletedClues(newInput);

    if (checkCompletion(newInput)) {
      setIsComplete(true);
      setShowModal(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  }, [activeClue, activeDir, grid, userInput, revealedCells, checkCompletion, updateCompletedClues]);

  const handleRevealPuzzle = useCallback(() => {
    const newInput = userInput.map((r) => [...r]);
    const newRevealed = new Set(revealedCells);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r]?.[c];
        if (cell) {
          newInput[r][c] = cell.letter;
          newRevealed.add(`${r},${c}`);
        }
      }
    }

    setUserInput(newInput);
    setRevealedCells(newRevealed);
    setIsComplete(true);
    setShowModal(true);
    updateCompletedClues(newInput);
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  }, [grid, userInput, revealedCells, updateCompletedClues]);

  // Restart
  const handleRestart = useCallback(() => {
    setUserInput(createEmptyInput());
    setIncorrectCells(new Set());
    setRevealedCells(new Set());
    setIsComplete(false);
    setShowModal(false);
    setSeconds(0);
    setCompletedClues(new Set());
    const first = findFirstCell();
    setActiveCell(first);
    setActiveDir('A');
    const cell = grid[first.row]?.[first.col];
    setActiveClue(cell?.acrossClue || cell?.downClue || null);
    localStorage.removeItem(STORAGE_KEY);
  }, [grid]);

  // Get current clue text for display bar
  const getCurrentClueText = () => {
    const clues = activeDir === 'A' ? acrossClues : downClues;
    const clue = clues.find((c) => c.number === activeClue);
    if (!clue) return '';
    return `${clue.number} ${activeDir === 'A' ? 'Across' : 'Down'}: ${clue.clue}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hidden input for mobile keyboard support */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="text"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        className="absolute -left-full"
        onInput={handleMobileInput}
        onChange={(e) => e.target.value = ''}
      />

      {/* Landing overlay */}
      {showLanding && (
        <LandingOverlay onPlay={() => setShowLanding(false)} />
      )}

      {/* Header */}
      <header className="border-b border-[#e6e6e6] px-4 py-3">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="font-serif text-xl font-black italic text-[#121212] leading-tight">
                  The Crossword
                </h1>
                <span className="font-sans text-sm text-[#121212] hidden sm:inline">
                  Saturday, February 14, 2026
                </span>
              </div>
              <p className="font-sans text-xs text-[#666] mt-0.5">
                By Adam Lopez
              </p>
            </div>
            <TimerDisplay
              seconds={seconds}
              isPaused={isPaused}
              onTogglePause={() => setIsPaused(!isPaused)}
            />
          </div>
          <Toolbar
            onCheck={handleCheck}
            onRevealLetter={handleRevealLetter}
            onRevealWord={handleRevealWord}
            onRevealPuzzle={handleRevealPuzzle}
            onRestart={handleRestart}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {/* Current clue bar */}
        <div className="mb-4 px-3 py-2 bg-[#f7f7f7] rounded text-sm font-sans text-[#121212] font-medium">
          {getCurrentClueText()}
        </div>

        {/* Grid */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <CrosswordGrid
              grid={grid}
              userInput={userInput}
              activeCell={activeCell}
              activeDir={activeDir}
              activeClue={activeClue}
              incorrectCells={incorrectCells}
              revealedCells={revealedCells}
              isComplete={isComplete}
              onCellClick={handleCellClick}
              onKeyDown={handleKeyDown}
            />

            {/* Hidden input for mobile keyboards (caret hidden) */}
            <input
              ref={hiddenInputRef}
              type="text"
              inputMode="latin"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-hidden={true}
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                opacity: 0,
                color: 'transparent',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                caretColor: 'transparent',
                padding: 0,
                margin: 0,
              }}
              onInput={handleMobileInput}
            />
          </div>
        </div>

        {/* Clues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClueList
            title="Across"
            clues={acrossClues}
            activeClue={activeClue}
            activeDir={activeDir}
            dir="A"
            completedClues={completedClues}
            onClueClick={handleClueClick}
          />
          <ClueList
            title="Down"
            clues={downClues}
            activeClue={activeClue}
            activeDir={activeDir}
            dir="D"
            completedClues={completedClues}
            onClueClick={handleClueClick}
          />
        </div>
      </main>

      {/* Completion modal */}
      {showModal && (
        <CompletionModal seconds={seconds} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
