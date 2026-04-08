import React, { useState, useEffect } from 'react';
import { Clock3, Plus, X, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'otsTimetable';
const loadSlots = () => { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; } };

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

const SUBJECT_COLORS = {
  'DSA': '#F97316', 'Mathematics': '#3B82F6', 'Physics': '#A855F7', 'Chemistry': '#22C55E',
  'Biology': '#EC4899', 'System Design': '#EAB308', 'English': '#14B8A6', 'Other': '#6B7280',
  'Lunch': '#EF4444', 'Free Time': '#64748B', 'Exercise': '#F59E0B',
};
const SUBJECTS = Object.keys(SUBJECT_COLORS);

export default function TimetablePage() {
  const [slots, setSlots] = useState(loadSlots);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [subject, setSubject] = useState('DSA');
  const [startHour, setStartHour] = useState('9');
  const [endHour, setEndHour] = useState('10');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(slots)); }, [slots]);

  const addSlot = (e) => {
    e.preventDefault();
    const s = { id: Date.now().toString(), day: selectedDay, subject, startHour: +startHour, endHour: +endHour, color: SUBJECT_COLORS[subject] || '#F97316' };
    setSlots(prev => [...prev, s]);
    setShowAdd(false);
  };

  const deleteSlot = (id) => setSlots(prev => prev.filter(s => s.id !== id));

  const getSlot = (day, hour) => slots.find(s => s.day === day && s.startHour <= hour && s.endHour > hour);
  const isSlotStart = (day, hour) => slots.find(s => s.day === day && s.startHour === hour);

  return (
    <div className="page-enter max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Timetable</h1>
          <p className="text-slate-400 text-sm">Weekly study schedule</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-brand-accent hover:bg-brand-accent-hover text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-accent/20">
          <Plus size={18} /> Add Slot
        </button>
      </div>

      {/* Timetable grid */}
      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-left w-16">Time</th>
              {DAYS.map(d => (
                <th key={d} className="py-3 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  {d.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour} className="border-b border-brand-border/30">
                <td className="py-1 px-3 text-xs text-slate-500 font-mono">
                  {hour.toString().padStart(2, '0')}:00
                </td>
                {DAYS.map(day => {
                  const slot = getSlot(day, hour);
                  const isStart = isSlotStart(day, hour);

                  if (slot && !isStart) return <td key={day} className="p-0" />;

                  if (slot && isStart) {
                    const span = slot.endHour - slot.startHour;
                    return (
                      <td key={day} rowSpan={span} className="p-1">
                        <div
                          className="h-full rounded-lg p-2 text-xs font-medium relative group cursor-default min-h-[36px]"
                          style={{ backgroundColor: slot.color + '20', color: slot.color, borderLeft: `3px solid ${slot.color}` }}
                        >
                          <div className="font-bold">{slot.subject}</div>
                          <div className="opacity-70 text-[10px]">{slot.startHour}:00 - {slot.endHour}:00</div>
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded transition-all"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={day} className="p-1">
                      <div className="h-[36px] rounded-lg hover:bg-white/3 transition-colors" />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-6">
        {Object.entries(SUBJECT_COLORS).slice(0, 8).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            {name}
          </div>
        ))}
      </div>

      {/* Add slot modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-scale">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="text-lg font-bold text-white">Add Time Slot</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={addSlot} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">Day</label>
                <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white focus:outline-none focus:border-brand-accent transition-all appearance-none">
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white focus:outline-none focus:border-brand-accent transition-all appearance-none">
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">Start Hour</label>
                  <select value={startHour} onChange={e => setStartHour(e.target.value)} className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white focus:outline-none focus:border-brand-accent transition-all appearance-none">
                    {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">End Hour</label>
                  <select value={endHour} onChange={e => setEndHour(e.target.value)} className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white focus:outline-none focus:border-brand-accent transition-all appearance-none">
                    {HOURS.map(h => <option key={h} value={h + 1}>{h + 1}:00</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3 rounded-xl font-bold transition-all">Add Slot</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
