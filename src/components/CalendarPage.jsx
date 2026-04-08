import React, { useState } from 'react';
import { CalendarDays, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'otsCalendar';
const loadEvents = () => { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; } };

const SUBJECT_COLORS = {
  'DSA': '#F97316', 'Mathematics': '#3B82F6', 'Physics': '#A855F7', 'Chemistry': '#22C55E',
  'Biology': '#EC4899', 'System Design': '#EAB308', 'HR Prep': '#14B8A6', 'Other': '#6B7280',
  'Study': '#F97316', 'Break': '#22C55E', 'Exam': '#EF4444', 'Project': '#8B5CF6',
};

const SUBJECTS = Object.keys(SUBJECT_COLORS);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [events, setEvents] = useState(loadEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Study');
  const [time, setTime] = useState('09:00');

  const saveEvents = (evts) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(evts)); setEvents(evts); };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getDayStr = (day) => `${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
  const getEventsForDay = (day) => events.filter(e => e.date === getDayStr(day));

  const addEvent = (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedDay) return;
    const evt = {
      id: Date.now().toString(),
      title: title.trim(),
      subject,
      date: getDayStr(selectedDay),
      time,
      color: SUBJECT_COLORS[subject] || '#F97316',
    };
    saveEvents([...events, evt]);
    setTitle(''); setShowAdd(false);
  };

  const deleteEvent = (id) => saveEvents(events.filter(e => e.id !== id));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="page-enter max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-black text-white mb-2">Calendar</h1>
      <p className="text-slate-400 text-sm mb-6">Plan your study schedule</p>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 bg-brand-card border border-brand-border rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-all">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-white min-w-[180px] text-center">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 bg-brand-card border border-brand-border rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
        <button onClick={goToday} className="text-sm text-brand-accent hover:text-brand-accent-hover font-medium transition-colors">Today</button>
      </div>

      {/* Calendar grid */}
      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-brand-border">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="min-h-[80px] border-b border-r border-brand-border/50 bg-brand-bg/30" />;
            const dayStr = getDayStr(day);
            const isToday = dayStr === todayStr;
            const dayEvents = getEventsForDay(day);
            const isSelected = selectedDay === day;

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`min-h-[80px] border-b border-r border-brand-border/50 p-1.5 cursor-pointer transition-all hover:bg-white/3
                  ${isSelected ? 'bg-brand-accent/10' : ''}`}
              >
                <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-brand-accent text-white' : isSelected ? 'text-brand-accent' : 'text-slate-400'}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div key={ev.id} className="text-[9px] font-medium px-1 py-0.5 rounded truncate" style={{ backgroundColor: ev.color + '20', color: ev.color }}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[9px] text-slate-500 px-1">+{dayEvents.length - 2} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">{MONTHS[month]} {selectedDay}, {year}</h3>
            <button onClick={() => setShowAdd(true)} className="bg-brand-accent hover:bg-brand-accent-hover text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all">
              <Plus size={14} /> Add Event
            </button>
          </div>

          {getEventsForDay(selectedDay).length === 0 ? (
            <p className="text-slate-500 text-sm">No events scheduled</p>
          ) : (
            <div className="space-y-2">
              {getEventsForDay(selectedDay).map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-3 bg-brand-bg border border-brand-border rounded-xl group">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: ev.color }} />
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{ev.title}</div>
                    <div className="text-xs text-slate-400">{ev.time} • {ev.subject}</div>
                  </div>
                  <button onClick={() => deleteEvent(ev.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add event modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-scale">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="text-lg font-bold text-white">Add Event</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={addEvent} className="p-6 space-y-4">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all" autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <select value={subject} onChange={e => setSubject(e.target.value)} className="bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white focus:outline-none focus:border-brand-accent transition-all appearance-none">
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white focus:outline-none focus:border-brand-accent transition-all" />
              </div>
              <button type="submit" disabled={!title.trim()} className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3 rounded-xl font-bold transition-all disabled:opacity-40">Add Event</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
