import React, { useState } from 'react';
import { Settings, Trash2, Moon, Sun, RotateCcw, AlertTriangle, Check, Palette } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { theme, setTheme, resetAllData, username, logout } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pomodoroWork, setPomodoroWork] = useState(() => localStorage.getItem('otsPomodoroWork') || '25');
  const [pomodoroBreak, setPomodoroBreak] = useState(() => localStorage.getItem('otsPomodoroBreak') || '5');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(() => localStorage.getItem('otsFirstDay') || 'Sunday');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('otsPomodoroWork', pomodoroWork);
    localStorage.setItem('otsPomodoroBreak', pomodoroBreak);
    localStorage.setItem('otsFirstDay', firstDayOfWeek);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="page-enter max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-black text-white mb-2">Settings</h1>
      <p className="text-slate-400 text-sm mb-8">Customize your study experience</p>

      <div className="space-y-6">

        {/* Theme */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} className="text-brand-accent" />
            <h3 className="text-sm font-bold text-white">Theme</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'dark', label: 'Dark', desc: 'Default dark', icon: Moon },
              { value: 'darker', label: 'Darker', desc: 'AMOLED black', icon: Moon },
              { value: 'light', label: 'Light', desc: 'Coming soon', icon: Sun, disabled: true },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => !t.disabled && setTheme(t.value)}
                  disabled={t.disabled}
                  className={`p-4 rounded-xl text-left transition-all border
                    ${theme === t.value ? 'bg-brand-accent/10 border-brand-accent text-brand-accent' : 'bg-brand-bg border-brand-border text-slate-400 hover:border-slate-600'}
                    ${t.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Icon size={18} className="mb-2" />
                  <div className="text-sm font-bold">{t.label}</div>
                  <div className="text-xs opacity-70">{t.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timer Preferences */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} className="text-brand-accent" />
            <h3 className="text-sm font-bold text-white">Timer Preferences</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Work Duration (min)</label>
              <input
                type="number"
                value={pomodoroWork}
                onChange={e => setPomodoroWork(e.target.value)}
                min="1" max="120"
                className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white focus:outline-none focus:border-brand-accent transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Break Duration (min)</label>
              <input
                type="number"
                value={pomodoroBreak}
                onChange={e => setPomodoroBreak(e.target.value)}
                min="1" max="30"
                className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white focus:outline-none focus:border-brand-accent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} className="text-brand-accent" />
            <h3 className="text-sm font-bold text-white">Calendar Settings</h3>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">First Day of Week</label>
            <select
              value={firstDayOfWeek}
              onChange={e => setFirstDayOfWeek(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white focus:outline-none focus:border-brand-accent transition-all appearance-none"
            >
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
            </select>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20"
        >
          {saved ? <><Check size={18} /> Saved!</> : 'Save Settings'}
        </button>

        {/* Account */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Account</h3>
          <div className="flex items-center justify-between p-3 bg-brand-bg border border-brand-border rounded-xl mb-3">
            <div>
              <div className="text-sm font-medium text-white">{username}</div>
              <div className="text-xs text-slate-400">Display name</div>
            </div>
            <button onClick={logout} className="text-sm text-slate-400 hover:text-red-400 font-medium transition-colors">
              Sign Out
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-brand-card border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-400" />
            <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">This will permanently delete all your local data including notes, tasks, books, calendar events, and settings.</p>

          {showResetConfirm ? (
            <div className="flex gap-3 animate-fade-in">
              <button
                onClick={handleReset}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Confirm Delete All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-brand-bg border border-brand-border text-white py-2.5 rounded-xl font-medium hover:border-slate-600 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Reset All Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
