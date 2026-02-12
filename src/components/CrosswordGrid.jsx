import { useRef, useEffect, useCallback, useState } from 'react';

export default function CrosswordGrid({
  grid,
  userInput,
  activeCell,
  activeDir,
  activeClue,
  incorrectCells,
  revealedCells,
  isComplete,
  onCellClick,
  onKeyDown,
}) {
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(40);

  const rows = grid.length;
  const cols = grid[0].length;

  // Focus when active cell changes
  useEffect(() => {
    if (activeCell && gridRef.current) {
      gridRef.current.focus();
    }
  }, [activeCell]);

  // Compute bounds (non-null cell bounding box)
  const bounds = (() => {
    let minR = rows, maxR = 0, minC = cols, maxC = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c]) {
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
        }
      }
    }
    return { minR, maxR, minC, maxC };
  })();

  const gridRows = bounds.maxR - bounds.minR + 1;
  const gridCols = bounds.maxC - bounds.minC + 1;

  // Responsive cell sizing
  useEffect(() => {
    const updateSize = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 600);
      const maxHeight = window.innerHeight * 0.5;
      const sizeByWidth = Math.floor(maxWidth / gridCols);
      const sizeByHeight = Math.floor(maxHeight / gridRows);
      setCellSize(Math.min(sizeByWidth, sizeByHeight, 44));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [gridCols, gridRows]);

  // Get cells belonging to the active word
  const activeWordCells = useCallback(() => {
    if (!activeCell || activeClue === null) return new Set();
    const cells = new Set();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (!cell) continue;
        if (activeDir === 'A' && cell.acrossClue === activeClue) {
          cells.add(`${r},${c}`);
        } else if (activeDir === 'D' && cell.downClue === activeClue) {
          cells.add(`${r},${c}`);
        }
      }
    }
    return cells;
  }, [activeCell, activeClue, activeDir, grid, rows, cols])();

  const fontSize = Math.max(10, Math.floor(cellSize * 0.55));
  const numFontSize = Math.max(7, Math.floor(cellSize * 0.24));

  return (
    <div
      ref={gridRef}
      className="outline-none"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div
        ref={containerRef}
        className="inline-grid border-[2px] border-[#121212] select-none"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridRows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: gridRows }, (_, ri) =>
          Array.from({ length: gridCols }, (_, ci) => {
            const r = ri + bounds.minR;
            const c = ci + bounds.minC;
            const cell = grid[r]?.[c];
            const key = `${r},${c}`;

            if (!cell) {
              return (
                <div
                  key={key}
                  className="bg-[#121212]"
                  style={{ gridRow: ri + 1, gridColumn: ci + 1 }}
                />
              );
            }

            const isActive = activeCell?.row === r && activeCell?.col === c;
            const isInWord = activeWordCells.has(key);
            const isIncorrect = incorrectCells.has(key);
            const isRevealed = revealedCells.has(key);
            const value = userInput[r]?.[c] || '';

            let bgColor = '#ffffff';
            if (isActive) {
              bgColor = '#f7da21';
            } else if (isInWord) {
              bgColor = '#a7d8ff';
            }

            return (
              <div
                key={key}
                className={`
                  relative cursor-pointer flex items-center justify-center
                  transition-colors duration-75
                  ${isIncorrect ? 'cell-incorrect' : ''}
                `}
                style={{
                  gridRow: ri + 1,
                  gridColumn: ci + 1,
                  backgroundColor: bgColor,
                  borderRight: '0.5px solid #3a3a3a',
                  borderBottom: '0.5px solid #3a3a3a',
                  borderLeft: ci === 0 ? 'none' : '0.5px solid #3a3a3a',
                  borderTop: ri === 0 ? 'none' : '0.5px solid #3a3a3a',
                }}
                onClick={() => onCellClick(r, c)}
              >
                {cell.number && (
                  <span
                    className="absolute font-sans font-semibold text-[#121212] leading-none pointer-events-none"
                    style={{
                      top: '1px',
                      left: '2px',
                      fontSize: `${numFontSize}px`,
                    }}
                  >
                    {cell.number}
                  </span>
                )}

                <span
                  className={`
                    font-serif uppercase leading-none pointer-events-none
                    ${isRevealed ? 'text-[#236b8e]' : 'text-[#121212]'}
                  `}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontWeight: 500,
                  }}
                >
                  {value}
                </span>

                {isIncorrect && (
                  <div
                    className="absolute top-0 right-0 w-0 h-0 pointer-events-none"
                    style={{
                      borderTop: `${Math.floor(cellSize * 0.2)}px solid #e60000`,
                      borderLeft: `${Math.floor(cellSize * 0.2)}px solid transparent`,
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
