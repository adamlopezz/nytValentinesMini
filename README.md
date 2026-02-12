# Valentine's Day Crossword Puzzle

A fun, interactive crossword puzzle game built for Valentine's Day! This web application lets you solve a crossword puzzle with themed clues, featuring helpful tools like revealing letters/words, checking answers, and a countdown timer.

## Features

- **Interactive Crossword Grid** - Click and drag to solve across and down clues
- **Real-time Validation** - Check your answers as you type
- **Helpful Tools**:
  - Reveal individual letters
  - Reveal entire words
  - Reveal the complete puzzle
  - Restart to try again
- **Timer** - Track how long it takes you to complete the puzzle
- **Progress Saving** - Your progress is automatically saved to local storage
- **Completion Celebration** - Confetti animation when you finish!
- **Responsive Design** - Built with Tailwind CSS for a polished look

## Tech Stack

- **React 19** - UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Canvas Confetti** - Celebration animations
- **ESLint** - Code quality

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5174/`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── App.jsx                 # Main app component with game logic
├── main.jsx               # Entry point
├── index.css              # Global styles
├── puzzleData.js          # Crossword puzzle data and grid building
└── components/
    ├── CrosswordGrid.jsx   # Crossword grid rendering and input
    ├── ClueList.jsx        # Across/down clues display
    ├── Toolbar.jsx         # Control buttons (check, reveal, restart)
    ├── Timer.jsx           # Timer display component
    ├── CompletionModal.jsx # Celebration modal on completion
    └── LandingOverlay.jsx  # Welcome/instructions overlay
```

## How to Play

1. Click on a cell to start entering answers
2. Type letters for across and down clues
3. Use the toolbar buttons to:
   - **Check** - Verify your answers
   - **Reveal Letter** - Show one letter in the selected word
   - **Reveal Word** - Show the entire selected word
   - **Reveal Puzzle** - Show all answers
   - **Restart** - Clear and start over
4. Watch the timer as you race to complete it!
5. Celebrate with confetti when you finish!

## License

MIT
