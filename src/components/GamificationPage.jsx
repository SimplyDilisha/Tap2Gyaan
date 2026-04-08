import React from 'react';
import { Trophy, Zap, Star, Award, Flame, BookOpen, Clock, Target, Shield, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ALL_ACHIEVEMENTS = [
  { id: 'first_session', icon: Star, label: 'First Session', desc: 'Complete your first study session', xpReward: 50, color: '#F97316' },
  { id: 'five_sessions', icon: Zap, label: '5 Sessions', desc: 'Complete 5 study sessions', xpReward: 100, color: '#EAB308' },
  { id: 'one_hour', icon: Clock, label: 'Hour Power', desc: 'Study for 1 hour total', xpReward: 100, color: '#3B82F6' },
  { id: 'quiz_master', icon: Trophy, label: 'Quiz Master', desc: 'Score 100% on a quiz', xpReward: 150, color: '#22C55E' },
  { id: 'note_taker', icon: BookOpen, label: 'Note Taker', desc: 'Create 10 notes', xpReward: 75, color: '#A855F7' },
  { id: 'streak_3', icon: Flame, label: '3-Day Streak', desc: 'Study 3 days in a row', xpReward: 100, color: '#EF4444' },
  { id: 'streak_7', icon: Flame, label: 'Week Warrior', desc: 'Study 7 days in a row', xpReward: 250, color: '#F97316' },
  { id: 'planner_pro', icon: Target, label: 'Planner Pro', desc: 'Complete 20 tasks', xpReward: 100, color: '#14B8A6' },
  { id: 'bookworm', icon: BookOpen, label: 'Bookworm', desc: 'Finish reading a book', xpReward: 200, color: '#8B5CF6' },
  { id: 'night_owl', icon: Shield, label: 'Night Owl', desc: 'Study past midnight', xpReward: 50, color: '#6366F1' },
  { id: 'early_bird', icon: Star, label: 'Early Bird', desc: 'Study before 6 AM', xpReward: 50, color: '#FBBF24' },
  { id: 'legend', icon: Crown, label: 'Legend', desc: 'Reach Level 10', xpReward: 500, color: '#F97316' },
];

const DAILY_CHALLENGES = [
  { id: 'dc1', label: 'Study for 30 minutes', xp: 30 },
  { id: 'dc2', label: 'Complete a quiz', xp: 25 },
  { id: 'dc3', label: 'Create a note', xp: 15 },
  { id: 'dc4', label: 'Complete 3 Pomodoro sessions', xp: 40 },
  { id: 'dc5', label: 'Add a task to your planner', xp: 10 },
];

export default function GamificationPage() {
  const { xp, achievements } = useApp();

  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const xpForNext = 500;
  const progress = (xpInLevel / xpForNext) * 100;

  // Deterministic daily challenges based on date
  const todaySeed = new Date().toDateString();
  const todayChallenges = DAILY_CHALLENGES.sort((a, b) => {
    const ha = [...(todaySeed + a.id)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hb = [...(todaySeed + b.id)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return ha - hb;
  }).slice(0, 3);

  return (
    <div className="page-enter max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-black text-white mb-2">Gamification</h1>
      <p className="text-slate-400 text-sm mb-8">Track your progress and unlock achievements</p>

      {/* Level card */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-accent/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-accent to-amber-500 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-brand-accent/30">
              {level}
            </div>
            <div>
              <div className="text-sm text-slate-400 font-medium">Current Level</div>
              <div className="text-2xl font-black text-white">Level {level}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-slate-400">Total XP</div>
              <div className="text-xl font-black text-brand-accent">{xp.toLocaleString()}</div>
            </div>
          </div>

          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>Level {level}</span>
            <span>{xpInLevel} / {xpForNext} XP</span>
            <span>Level {level + 1}</span>
          </div>
          <div className="h-3 bg-brand-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-accent to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily challenges */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 mb-8">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          Daily Challenges
        </h3>
        <div className="space-y-3">
          {todayChallenges.map(ch => (
            <div key={ch.id} className="flex items-center gap-3 p-3 bg-brand-bg border border-brand-border rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Star size={14} className="text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{ch.label}</div>
                <div className="text-xs text-brand-accent">+{ch.xp} XP</div>
              </div>
              <div className="w-5 h-5 rounded-md border-2 border-slate-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Award size={16} className="text-brand-accent" />
          Achievements ({achievements.length} / {ALL_ACHIEVEMENTS.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_ACHIEVEMENTS.map(ach => {
            const Icon = ach.icon;
            const unlocked = achievements.find(a => a.id === ach.id);
            return (
              <div
                key={ach.id}
                className={`bg-brand-card border rounded-xl p-4 flex items-center gap-3 transition-all
                  ${unlocked ? 'border-brand-accent/30 bg-brand-accent/5' : 'border-brand-border opacity-60'}`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (unlocked ? ach.color : '#333') + '20' }}
                >
                  <Icon size={20} style={{ color: unlocked ? ach.color : '#555' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${unlocked ? 'text-white' : 'text-slate-500'}`}>{ach.label}</div>
                  <div className="text-xs text-slate-400 truncate">{ach.desc}</div>
                </div>
                <div className="text-xs font-bold text-brand-accent shrink-0">+{ach.xpReward}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
