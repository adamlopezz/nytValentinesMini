import { useState, useEffect, useRef } from 'react';

export default function Timer({ isRunning, isPaused }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  const reset = () => setSeconds(0);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return { seconds, reset, formatted: formatTime(seconds) };
}

export function TimerDisplay({ seconds, isPaused, onTogglePause }) {
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <button
      onClick={onTogglePause}
      className="font-sans text-sm text-[#121212] flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
      title={isPaused ? 'Resume timer' : 'Pause timer'}
    >
      {isPaused ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      )}
      <span className="tabular-nums">{formatTime(seconds)}</span>
    </button>
  );
}
