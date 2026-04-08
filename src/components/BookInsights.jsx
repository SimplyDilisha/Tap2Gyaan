import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, X, Trash2, Edit3, BookMarked } from 'lucide-react';

const STORAGE_KEY = 'otsBooks';
const loadBooks = () => { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; } };

export default function BookInsights() {
  const [books, setBooks] = useState(loadBooks);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [insights, setInsights] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(books)); }, [books]);

  const resetForm = () => { setTitle(''); setAuthor(''); setTotalPages(''); setPagesRead(''); setInsights(''); setEditId(null); setShowAdd(false); };

  const addBook = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editId) {
      setBooks(prev => prev.map(b => b.id === editId ? { ...b, title, author, totalPages: +totalPages, pagesRead: +pagesRead, insights, updatedAt: Date.now() } : b));
    } else {
      setBooks(prev => [...prev, { id: Date.now().toString(), title, author, totalPages: +totalPages || 100, pagesRead: +pagesRead || 0, insights, createdAt: Date.now(), updatedAt: Date.now() }]);
    }
    resetForm();
  };

  const startEdit = (book) => {
    setEditId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setTotalPages(book.totalPages.toString());
    setPagesRead(book.pagesRead.toString());
    setInsights(book.insights || '');
    setShowAdd(true);
  };

  const deleteBook = (id) => { setBooks(prev => prev.filter(b => b.id !== id)); if (selected === id) setSelected(null); };

  const totalRead = books.reduce((a, b) => a + b.pagesRead, 0);
  const totalBookPages = books.reduce((a, b) => a + b.totalPages, 0);
  const completedBooks = books.filter(b => b.pagesRead >= b.totalPages).length;

  return (
    <div className="page-enter max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Book Insights</h1>
          <p className="text-slate-400 text-sm">{books.length} books • {totalRead} pages read</p>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(true); }} className="bg-brand-accent hover:bg-brand-accent-hover text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-accent/20">
          <Plus size={18} /> Add Book
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-white">{books.length}</div>
          <div className="text-xs text-slate-400 mt-1">Books</div>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-brand-accent">{totalRead}</div>
          <div className="text-xs text-slate-400 mt-1">Pages Read</div>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-brand-success">{completedBooks}</div>
          <div className="text-xs text-slate-400 mt-1">Completed</div>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-scale">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="text-lg font-bold text-white">{editId ? 'Edit Book' : 'Add Book'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={addBook} className="p-6 space-y-4">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Book title" className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all" autoFocus />
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={totalPages} onChange={e => setTotalPages(e.target.value)} placeholder="Total pages" className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all" />
                <input type="number" value={pagesRead} onChange={e => setPagesRead(e.target.value)} placeholder="Pages read" className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all" />
              </div>
              <textarea value={insights} onChange={e => setInsights(e.target.value)} placeholder="Key insights / highlights..." rows={3} className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all resize-none" />
              <button type="submit" disabled={!title.trim()} className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3 rounded-xl font-bold transition-all disabled:opacity-40">
                {editId ? 'Update Book' : 'Add Book'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Books grid */}
      {books.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-brand-card rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-border">
            <BookOpen size={28} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No books yet</h3>
          <p className="text-slate-400 text-sm">Track your reading progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {books.map(book => {
            const pct = Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100));
            const isDone = pct >= 100;
            return (
              <div key={book.id} className="bg-brand-card border border-brand-border rounded-2xl p-5 hover:border-slate-600 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDone ? 'bg-green-500/15' : 'bg-brand-accent/15'}`}>
                      <BookMarked size={20} className={isDone ? 'text-green-400' : 'text-brand-accent'} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white line-clamp-1">{book.title}</h3>
                      {book.author && <p className="text-xs text-slate-400">{book.author}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(book)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"><Edit3 size={14} /></button>
                    <button onClick={() => deleteBook(book.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>{book.pagesRead} / {book.totalPages} pages</span>
                    <span className={isDone ? 'text-green-400 font-bold' : 'text-brand-accent font-medium'}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isDone ? 'bg-green-500' : 'bg-brand-accent'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {book.insights && (
                  <p className="text-xs text-slate-400 line-clamp-2 italic">"{book.insights}"</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
