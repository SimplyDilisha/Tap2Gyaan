import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Flame, Target, TrendingUp } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useApp } from '../context/AppContext';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export default function ReportsPage() {
  const { userId } = useApp();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('week'); // week | month | all

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const q = query(
          collection(db, 'sessions'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(200)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSessions(data);
      } catch (e) {
        console.error('Failed to fetch sessions:', e);
        // Use localStorage fallback
        try {
          const saved = localStorage.getItem('otsSessions');
          if (saved) setSessions(JSON.parse(saved));
        } catch {}
      }
      setLoading(false);
    };
    fetchSessions();
  }, [userId]);

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const filteredSessions = sessions.filter(s => {
    const t = s.startTime || s.timestamp?.seconds * 1000 || 0;
    if (range === 'week') return t >= weekAgo;
    if (range === 'month') return t >= monthAgo;
    return true;
  });

  const totalTime = filteredSessions.reduce((a, s) => a + (s.duration || 0), 0);
  const totalSessions = filteredSessions.length;
  const avgSession = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;

  // Subject breakdown
  const subjectMap = {};
  filteredSessions.forEach(s => {
    const sub = s.subject || 'Other';
    subjectMap[sub] = (subjectMap[sub] || 0) + (s.duration || 0);
  });
  const subjectEntries = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]);
  const maxSubjectTime = subjectEntries.length > 0 ? subjectEntries[0][1] : 1;

  // Daily breakdown (last 7 days)
  const dailyMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString('en-US', { weekday: 'short' });
    dailyMap[key] = 0;
  }
  filteredSessions.forEach(s => {
    const t = s.startTime || s.timestamp?.seconds * 1000 || Date.now();
    const d = new Date(t);
    const key = d.toLocaleDateString('en-US', { weekday: 'short' });
    if (dailyMap[key] !== undefined) dailyMap[key] += (s.duration || 0);
  });
  const dailyEntries = Object.entries(dailyMap);
  const maxDaily = Math.max(...Object.values(dailyMap), 1);

  // Streak calc
  const streak = (() => {
    const daySet = new Set();
    sessions.forEach(s => {
      const t = s.startTime || s.timestamp?.seconds * 1000;
      if (t) daySet.add(new Date(t).toDateString());
    });
    let count = 0;
    let d = new Date();
    while (daySet.has(d.toDateString())) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const SUBJECT_COLORS = {
    'DSA': '#F97316', 'Mathematics': '#3B82F6', 'Physics': '#A855F7', 'Chemistry': '#22C55E',
    'Biology': '#EC4899', 'System Design': '#EAB308', 'HR Prep': '#14B8A6', 'Other': '#6B7280',
  };

  if (loading) {
    return (
      <div className="page-enter max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-black text-white mb-8">Reports</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="bg-brand-card h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Reports</h1>
          <p className="text-slate-400 text-sm">Your study analytics</p>
        </div>
        <div className="flex gap-2">
          {['week','month','all'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${range === r ? 'bg-brand-accent text-white' : 'bg-brand-card border border-brand-border text-slate-400 hover:text-white'}`}
            >{r}</button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <Clock size={16} className="text-brand-accent mb-2" />
          <div className="text-xl font-black text-white">{formatDuration(totalTime)}</div>
          <div className="text-xs text-slate-400">Total study time</div>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <Target size={16} className="text-blue-400 mb-2" />
          <div className="text-xl font-black text-white">{totalSessions}</div>
          <div className="text-xs text-slate-400">Sessions</div>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <TrendingUp size={16} className="text-green-400 mb-2" />
          <div className="text-xl font-black text-white">{formatDuration(avgSession)}</div>
          <div className="text-xs text-slate-400">Avg session</div>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <Flame size={16} className="text-orange-400 mb-2" />
          <div className="text-xl font-black text-white">{streak} days</div>
          <div className="text-xs text-slate-400">Current streak</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily chart */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Daily Activity (Last 7 Days)</h3>
          <div className="flex items-end gap-2 h-40">
            {dailyEntries.map(([day, time]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative flex-1 flex items-end">
                  <div
                    className="w-full bg-brand-accent/80 rounded-t-md transition-all hover:bg-brand-accent min-h-[4px]"
                    style={{ height: `${Math.max(3, (time / maxDaily) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject breakdown */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Subject Breakdown</h3>
          {subjectEntries.length === 0 ? (
            <p className="text-slate-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {subjectEntries.map(([sub, time]) => (
                <div key={sub}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{sub}</span>
                    <span className="text-slate-400">{formatDuration(time)}</span>
                  </div>
                  <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${(time / maxSubjectTime) * 100}%`,
                      backgroundColor: SUBJECT_COLORS[sub] || '#F97316'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 mt-6">
        <h3 className="text-sm font-bold text-white mb-4">Recent Sessions</h3>
        {filteredSessions.length === 0 ? (
          <p className="text-slate-500 text-sm">No sessions recorded yet. Start studying!</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {filteredSessions.slice(0, 20).map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-brand-bg border border-brand-border/50 rounded-xl text-sm">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[s.subject] || '#F97316' }} />
                <span className="text-white font-medium flex-1">{s.subject || 'Study'}</span>
                <span className="text-slate-400 font-mono text-xs">{formatDuration(s.duration || 0)}</span>
                <span className="text-slate-500 text-xs">
                  {s.startTime ? new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
