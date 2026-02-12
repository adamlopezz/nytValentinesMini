export default function ClueList({
  title,
  clues,
  activeClue,
  activeDir,
  dir,
  completedClues,
  onClueClick,
}) {
  return (
    <div className="mb-4">
      <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-[#121212] mb-2 pb-1 border-b border-[#ccc]">
        {title}
      </h3>
      <div className="space-y-0">
        {clues.map((clue) => {
          const isActive = activeClue === clue.number && activeDir === dir;
          const isCompleted = completedClues.has(`${dir}-${clue.number}`);

          return (
            <button
              key={clue.number}
              className={`
                w-full text-left py-1.5 px-2 rounded-sm cursor-pointer
                transition-colors duration-100 block
                ${isActive ? 'bg-[#a7d8ff]' : 'hover:bg-[#f0f0f0]'}
              `}
              onClick={() => onClueClick(clue.number, dir)}
            >
              <span className="font-sans text-sm">
                <span className="font-bold mr-1.5">{clue.number}</span>
                <span className={isCompleted ? 'line-through text-[#999]' : ''}>
                  {clue.clue}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
