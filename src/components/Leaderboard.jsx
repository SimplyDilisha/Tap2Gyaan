import React from 'react';
import { Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

const formatTimeFull = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function Leaderboard({ members }) {
  const { userId } = useApp();

  const top10 = [...members]
    .sort((a, b) => b.todayTime - a.todayTime)
    .slice(0, 10);

  const getRankColor = (index) => {
    switch(index) {
      case 0: return 'text-yellow-400 font-black text-xl drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]';
      case 1: return 'text-slate-300 font-bold text-lg';
      case 2: return 'text-amber-600 font-bold text-lg';
      default: return 'text-slate-500 font-medium';
    }
  };

  return (
    <div className="bg-brand-card rounded-2xl shadow-xl border border-brand-border flex flex-col h-[500px]">
      <div className="p-5 border-b border-brand-border">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="text-brand-accent w-5 h-5" />
          Today's Leaderboard
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {top10.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            No statistics yet today.
          </div>
        ) : (
          <div className="divide-y divide-brand-border/50">
            {top10.map((member, index) => {
              const isMe = member.userId === userId;
              return (
                <div
                  key={member.userId}
                  className={`flex items-center gap-4 py-3 px-3 relative transition-colors hover:bg-white/3
                    ${isMe ? 'bg-brand-accent/5' : ''}`}
                >
                  {isMe && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-accent rounded-r-full" />
                  )}

                  <div className={`w-8 text-center ${getRankColor(index)}`}>
                    #{index + 1}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/40 to-amber-600/40 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {member.username ? member.username.charAt(0).toUpperCase() : '?'}
                  </div>

                  <div className="flex-1 truncate">
                    <span className={`font-semibold ${isMe ? 'text-white' : 'text-slate-300'}`}>
                      {member.username}
                    </span>
                  </div>

                  <div className="font-mono font-medium text-slate-300 tracking-wider text-sm">
                    {formatTimeFull(member.todayTime || 0)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
