import React, { useState, useEffect } from 'react';
import { ListChecks, Plus, Trash2, Check, Circle, X, Flag, Calendar } from 'lucide-react';

const STORAGE_KEY = 'otsPlanner';

const loadTasks = () => {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
};

const PRIORITIES = [
  { value: 'high', label: 'High', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { value: 'low', label: 'Low', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
];

export default function PlannerPage() {
  const [tasks, setTasks] = useState(loadTasks);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | done

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now().toString(),
      title: title.trim(),
      priority,
      dueDate: dueDate || null,
      done: false,
      createdAt: Date.now()
    }]);
    setTitle('');
    setPriority('medium');
    setDueDate('');
    setShowAdd(false);
  };

  const toggleDone = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.done));
  };

  const filtered = tasks
    .filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const pOrder = { high: 0, medium: 1, low: 2 };
      return pOrder[a.priority] - pOrder[b.priority];
    });

  const doneCount = tasks.filter(t => t.done).length;
  const activeCount = tasks.filter(t => !t.done).length;

  return (
    <div className="page-enter max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Planner</h1>
          <p className="text-slate-400 text-sm">{activeCount} active • {doneCount} completed</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-brand-accent hover:bg-brand-accent-hover text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-accent/20"
        >
          <Plus size={18} /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'done'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
              ${filter === f ? 'bg-brand-accent text-white' : 'bg-brand-card border border-brand-border text-slate-400 hover:text-white'}`}
          >
            {f}
          </button>
        ))}
        {doneCount > 0 && (
          <button onClick={clearCompleted} className="ml-auto text-sm text-slate-500 hover:text-red-400 transition-colors">
            Clear completed
          </button>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-scale">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="text-lg font-bold text-white">New Task</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={addTask} className="p-6 space-y-4">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all"
                autoFocus
              />
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border
                        ${priority === p.value ? `${p.bg} ${p.color} ${p.border}` : 'bg-brand-bg border-brand-border text-slate-400'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">Due Date (optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white focus:outline-none focus:border-brand-accent transition-all"
                />
              </div>
              <button type="submit" disabled={!title.trim()} className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3 rounded-xl font-bold transition-all disabled:opacity-40">
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tasks list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-brand-card rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-border">
            <ListChecks size={28} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{filter === 'done' ? 'No completed tasks' : 'All clear!'}</h3>
          <p className="text-slate-400 text-sm">{filter === 'all' ? 'Add a task to get started' : ''}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const prio = PRIORITIES.find(p => p.value === task.priority);
            return (
              <div
                key={task.id}
                className={`bg-brand-card border border-brand-border rounded-xl p-4 flex items-center gap-3 group transition-all hover:border-slate-600
                  ${task.done ? 'opacity-50' : ''}`}
              >
                <button
                  onClick={() => toggleDone(task.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all
                    ${task.done ? 'bg-brand-accent border-brand-accent' : 'border-slate-600 hover:border-brand-accent'}`}
                >
                  {task.done && <Check size={14} className="text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${task.done ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${prio.bg} ${prio.color}`}>{prio.label}</span>
                    {task.dueDate && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar size={9} /> {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
