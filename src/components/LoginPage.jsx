import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Flame, User, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [name, setName] = useState('');
  const { login, user } = useApp();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    login(name.trim());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-scale">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-accent to-amber-500 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-brand-accent/30 animate-pulse-glow">
            <Flame size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">One Tap Study</h1>
          <p className="text-slate-400 text-sm">Your all-in-one study companion</p>
        </div>

        {/* Login Card */}
        <div className="bg-brand-card/30 backdrop-blur-xl rounded-2xl border border-brand-border p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-brand-accent" />
            <h2 className="text-lg font-bold text-white">Get Started</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What should we call you?</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-brand-bg border border-brand-border pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                  autoFocus
                  maxLength={30}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-brand-accent to-amber-500 hover:from-brand-accent-hover hover:to-amber-400 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Start Studying
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-5">
            No sign-up needed. Your data stays on this device.
          </p>
        </div>
      </div>
    </div>
  );
}
