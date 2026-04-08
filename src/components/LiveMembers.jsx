import React, { useState, useEffect } from 'react';

const formatTimeShort = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if(h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function MemberCard({ member }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (member.isStudying && member.startTime) {
      const now = Date.now();
      const start = member.startTime;
      const diffSeconds = Math.floor((now - start) / 1000);
      setElapsed(diffSeconds > 0 ? diffSeconds : 0);

      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [member.isStudying, member.startTime]);

  const initials = member.username ? member.username.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-amber-500 flex items-center justify-center font-bold text-white shadow-inner text-sm">
          {initials}
        </div>
        <div>
          <div className="font-medium text-slate-200 text-sm">{member.username}</div>
          <div className="flex items-center gap-1.5 text-xs">
            {member.isStudying ? (
              <>
                <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse shadow-[0_0_5px_#22C55E]"></span>
                <span className="text-brand-success font-mono font-medium">{formatTimeShort(elapsed)}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                <span className="text-slate-500">Taking a break</span>
              </>
            )}
          </div>
        </div>
      </div>

      {member.isStudying && (
        <div className="bg-brand-accent/10 text-brand-accent text-xs px-2.5 py-1 rounded-md border border-brand-accent/20 font-medium">
          Studying
        </div>
      )}
    </div>
  );
}

export default function LiveMembers({ members }) {
  const studying = members.filter(m => m.isStudying).sort((a, b) => a.startTime - b.startTime);
  const resting = members.filter(m => !m.isStudying).sort((a, b) => b.todayTime - a.todayTime);

  return (
    <div className="bg-brand-card rounded-2xl shadow-xl border border-brand-border flex flex-col h-[500px]">
      <div className="p-5 border-b border-brand-border">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Live Status
          <span className="bg-brand-bg text-slate-400 text-xs px-2 py-0.5 rounded-full border border-brand-border">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {studying.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-brand-success uppercase tracking-wider mb-3 pl-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success"></span>
              Currently Studying ({studying.length})
            </h3>
            <div className="space-y-2">
              {studying.map(m => <MemberCard key={m.userId} member={m} />)}
            </div>
          </div>
        )}

        {resting.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              Taking a Break ({resting.length})
            </h3>
            <div className="space-y-2">
              {resting.map(m => <MemberCard key={m.userId} member={m} />)}
            </div>
          </div>
        )}

        {members.length === 0 && (
          <div className="h-full flex flex-col flex-1 items-center justify-center text-slate-500 py-10">
            <p>No members in this room yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
