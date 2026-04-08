import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, SkipForward, Settings2, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PRESETS = {
  classic: { work: 25 * 60, break: 5 * 60, longBreak: 15 * 60, label: '25/5' },
  fifty: { work: 50 * 60, break: 10 * 60, longBreak: 20 * 60, label: '50/10' },
  ninety: { work: 90 * 60, break: 15 * 60, longBreak: 30 * 60, label: '90/15' },
};

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
};

export default function PomodoroTimer() {
  const { addXP } = useApp();
  const [preset, setPreset] = useState('classic');
  const [mode, setMode] = useState('work'); // work | break | longBreak
  const [timeLeft, setTimeLeft] = useState(PRESETS.classic.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const intervalRef = useRef(null);

  const config = PRESETS[preset];

  const totalTime = mode === 'work' ? config.work : mode === 'break' ? config.break : config.longBreak;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const playSound = useCallback(() => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, 300);
    } catch(e) {}
  }, [soundOn]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            playSound();

            if (mode === 'work') {
              const newSessions = sessions + 1;
              setSessions(newSessions);
              addXP(25);
              // Every 4 sessions → long break
              if (newSessions % 4 === 0) {
                setMode('longBreak');
                return config.longBreak;
              } else {
                setMode('break');
                return config.break;
              }
            } else {
              setMode('work');
              return config.work;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, sessions, config, playSound, addXP]);

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(config.work);
    setMode('work');
  };

  const handleSkip = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(config.break);
    } else {
      setMode('work');
      setTimeLeft(config.work);
    }
  };

  const changePreset = (p) => {
    setPreset(p);
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode('work');
    setTimeLeft(PRESETS[p].work);
    setSessions(0);
  };

  const modeColor = mode === 'work' ? 'text-brand-accent' : mode === 'break' ? 'text-brand-success' : 'text-blue-400';
  const modeStroke = mode === 'work' ? '#F97316' : mode === 'break' ? '#22C55E' : '#60A5FA';
  const modeBg = mode === 'work' ? 'bg-brand-accent/10' : mode === 'break' ? 'bg-green-500/10' : 'bg-blue-500/10';
  const modeLabel = mode === 'work' ? 'Focus Time' : mode === 'break' ? 'Short Break' : 'Long Break';

  return (
    <div className="page-enter max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-black text-white mb-2">Pomodoro Timer</h1>
      <p className="text-slate-400 text-sm mb-8">Stay focused with timed study sessions</p>

      {/* Preset selector */}
      <div className="flex gap-2 mb-8 justify-center">
        {Object.entries(PRESETS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => changePreset(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${preset === key ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/25' : 'bg-brand-card text-slate-400 hover:text-white border border-brand-border'}`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center mb-8">
        <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${modeBg} ${modeColor}`}>
          {mode === 'work' ? <Settings2 size={12} className="inline mr-1.5" /> : <Coffee size={12} className="inline mr-1.5" />}
          {modeLabel}
        </div>

        <div className="relative w-72 h-72">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r={radius} fill="none" stroke="#1A1A1A" strokeWidth="8" />
            <circle
              cx="150" cy="150" r={radius} fill="none"
              stroke={modeStroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
              style={{ filter: `drop-shadow(0 0 8px ${modeStroke}40)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-6xl font-black font-mono tabular-nums ${modeColor}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-slate-500 mt-1">Session #{sessions + 1}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button onClick={handleReset} className="p-3 bg-brand-card border border-brand-border rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all">
          <RotateCcw size={20} />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 transition-all active:scale-95 shadow-xl
            ${isRunning
              ? 'bg-yellow-500 text-black shadow-yellow-500/25 hover:bg-yellow-400'
              : 'bg-brand-accent text-white shadow-brand-accent/25 hover:bg-brand-accent-hover'}`}
        >
          {isRunning ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          {isRunning ? 'Pause' : 'Start'}
        </button>

        <button onClick={handleSkip} className="p-3 bg-brand-card border border-brand-border rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all">
          <SkipForward size={20} />
        </button>

        <button onClick={() => setSoundOn(!soundOn)} className="p-3 bg-brand-card border border-brand-border rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all">
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-white">{sessions}</div>
          <div className="text-xs text-slate-400 mt-1">Completed</div>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-brand-accent">{Math.round(sessions * config.work / 60)}</div>
          <div className="text-xs text-slate-400 mt-1">Focus mins</div>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-brand-success">{sessions * 25}</div>
          <div className="text-xs text-slate-400 mt-1">XP Earned</div>
        </div>
      </div>
    </div>
  );
}
