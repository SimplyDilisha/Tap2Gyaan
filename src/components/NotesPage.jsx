import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Search, Trash2, Edit3, X, Save, Clock } from 'lucide-react';

const STORAGE_KEY = 'otsNotes';

const loadNotes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveNotes = (notes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

const COLORS = ['#F97316', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#EAB308'];

export default function NotesPage() {
  const [notes, setNotes] = useState(loadNotes);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null or note id
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const createNote = () => {
    if (!title.trim()) return;
    const note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      color,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes(prev => [note, ...prev]);
    resetForm();
  };

  const updateNote = () => {
    setNotes(prev => prev.map(n =>
      n.id === editing ? { ...n, title, content, color, updatedAt: Date.now() } : n
    ));
    resetForm();
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const startEdit = (note) => {
    setEditing(note.id);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setShowNew(true);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setColor(COLORS[0]);
    setEditing(null);
    setShowNew(false);
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-enter max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Notes</h1>
          <p className="text-slate-400 text-sm">{notes.length} notes</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowNew(true); }}
          className="bg-brand-accent hover:bg-brand-accent-hover text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-accent/20"
        >
          <Plus size={18} /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full bg-brand-card border border-brand-border pl-11 pr-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all"
        />
      </div>

      {/* Create/Edit Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-scale">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="text-lg font-bold text-white">{editing ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Note title"
                className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all"
                autoFocus
              />
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your note... (Markdown supported)"
                rows={8}
                className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all resize-none custom-scrollbar"
              />
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-brand-card scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={editing ? updateNote : createNote}
                disabled={!title.trim()}
                className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Save size={16} /> {editing ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-brand-card rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-border">
            <StickyNote size={28} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No notes yet</h3>
          <p className="text-slate-400 text-sm">Create your first note to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(note => (
            <div
              key={note.id}
              className="bg-brand-card border border-brand-border rounded-2xl p-5 hover:border-slate-600 transition-all group relative"
            >
              <div className="w-full h-1 rounded-full mb-4" style={{ backgroundColor: note.color }} />
              <h3 className="font-bold text-white mb-2 line-clamp-1">{note.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-3 mb-4 whitespace-pre-wrap">{note.content || 'No content'}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock size={10} />
                  {formatDate(note.updatedAt)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(note)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => deleteNote(note.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
