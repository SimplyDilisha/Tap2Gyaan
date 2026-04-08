import React from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { triggerToast } from './Toast';

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const SUBJECTS = [
  'DSA', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'System Design', 'HR Prep', 'Other'
];

export default function StudyTimer({ classId, currentTodayTime }) {
  const {
    isRunning, isPaused, elapsed, subject, setSubject,
    startStudying, pauseStudying, resumeStudying, stopStudying
  } = useTimer();

  const handleStart = () => {
    if (isPaused) {
      resumeStudying();
    } else {
      startStudying(classId);
    }
  };

  const handleStop = async () => {
    const dur = await stopStudying(currentTodayTime);
    if (dur > 0) {
      triggerToast(`Session saved — ${Math.round(dur/60)} mins studied`, 'success');
    }
  };

  return (
    <div className="bg-brand-card rounded-2xl p-6 shadow-xl border border-brand-border mb-6 relative overflow-hidden group">
      {isRunning && (
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-success/20">
          <div className="h-full bg-brand-success shadow-[0_0_10px_#22C55E] animate-[progress_2s_ease-in-out_infinite]" />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">

        <div className="w-full md:w-auto flex-1 max-w-sm">
          <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isRunning || isPaused}
            className="w-full bg-brand-bg text-white border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
          >
            {SUBJECTS.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-widest">Session Time</div>
          <div className={`text-6xl font-black font-mono tracking-tighter tabular-nums transition-colors ${
            isRunning ? 'text-brand-success drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]' : isPaused ? 'text-yellow-400' : 'text-white'
          }`}>
            {formatTime(elapsed)}
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          {(!isRunning && !isPaused) && (
            <button
              onClick={handleStart}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 active:scale-95"
            >
              <Play size={20} fill="currentColor" />
              Start Studying
            </button>
          )}

          {isRunning && (
            <button
              onClick={pauseStudying}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-yellow-400/20 active:scale-95"
            >
              <Pause size={20} fill="currentColor" />
              Pause
            </button>
          )}

          {isPaused && (
            <button
              onClick={handleStart}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 active:scale-95"
            >
              <Play size={20} fill="currentColor" />
              Resume
            </button>
          )}

          {(isRunning || isPaused) && (
            <button
              onClick={handleStop}
              className="flex-none flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95"
            >
              <Square size={20} fill="currentColor" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
