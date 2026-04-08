import React, { useState, useEffect } from 'react';
import { Search, Users, Shield, Globe, Plus, LogIn } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, getDocs, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import CreateClass from './CreateClass';
import { triggerToast } from './Toast';
import { useApp } from '../context/AppContext';

export default function JoinClass() {
  const [classes, setClasses] = useState([]);
  const [myMemberships, setMyMemberships] = useState(new Set());
  const [search, setSearch] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userId, username } = useApp();

  useEffect(() => {
    const qClasses = query(collection(db, 'classes'), where('isPublic', '==', true));
    const unsubClasses = onSnapshot(qClasses, (snapshot) => {
      const cls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(cls);
      setLoading(false);
    });

    const qMembers = query(collection(db, 'classMembers'), where('userId', '==', userId));
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      const ms = new Set(snapshot.docs.map(d => d.data().classId));
      setMyMemberships(ms);
    });

    return () => { unsubClasses(); unsubMembers(); };
  }, [userId]);

  const handleJoin = async (classObj) => {
    if (myMemberships.has(classObj.id)) {
      navigate(`/room/${classObj.id}`);
      return;
    }
    try {
      const memberRef = doc(db, 'classMembers', `${classObj.id}_${userId}`);
      await setDoc(memberRef, {
        classId: classObj.id,
        userId, username,
        todayTime: 0,
        isStudying: false,
        startTime: null
      });
      triggerToast('Joined class!');
      navigate(`/room/${classObj.id}`);
    } catch (e) {
      console.error("Join error:", e);
      triggerToast('Failed to join', 'error');
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    try {
      const q = query(collection(db, 'classes'), where('code', '==', codeInput.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        triggerToast('Class code not found', 'error');
        return;
      }
      const classDoc = snap.docs[0];
      await handleJoin({ id: classDoc.id });
    } catch (e) {
      console.error("Code join error:", e);
    }
  };

  const filtered = classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-enter max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-accent to-amber-500 flex items-center justify-center shadow-lg shadow-brand-accent/20">
              <LogIn className="w-4 h-4 text-white" />
            </span>
            Study Rooms
          </h1>
          <p className="text-slate-400 text-sm">Join a class or create your own</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-brand-card hover:bg-brand-surface text-white px-4 py-2.5 rounded-xl transition-all font-medium flex items-center gap-2 border border-brand-border hover:border-brand-accent"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Create Class</span>
        </button>
      </div>

      {/* Search & Code Join */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search public classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-card border border-brand-border pl-12 pr-4 py-4 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
          />
        </div>
        <form onSubmit={handleJoinByCode} className="relative flex">
          <input
            type="text"
            placeholder="Enter code"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="w-full bg-brand-card border border-brand-border pl-4 pr-24 py-4 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all uppercase font-mono"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-4 rounded-xl font-medium transition-colors"
          >
            Join
          </button>
        </form>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-brand-card h-48 rounded-2xl border border-brand-border"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-brand-card rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-border">
            <Users size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No classes found</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">Be the first to start a new study group!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Create Class Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(cls => {
            const isMember = myMemberships.has(cls.id);
            return (
              <div key={cls.id} className="bg-brand-card rounded-2xl p-6 border border-brand-border hover:border-brand-accent hover:shadow-lg hover:shadow-brand-accent/10 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-accent transition-colors line-clamp-1">{cls.name}</h3>
                    <span className="bg-brand-bg text-xs px-2.5 py-1 rounded-md text-slate-400 font-medium flex items-center gap-1.5 border border-brand-border">
                      {cls.isPublic ? <Globe size={12} className="text-blue-400"/> : <Shield size={12} className="text-yellow-400"/>}
                      {cls.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  {cls.description && (
                    <p className="text-slate-400 text-sm line-clamp-1 mb-4">{cls.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-border">
                  <button
                    onClick={() => handleJoin(cls)}
                    className={`px-5 py-2 rounded-xl font-medium transition-colors w-full ${
                      isMember
                      ? 'bg-brand-surface hover:bg-brand-border text-white'
                      : 'bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white border border-brand-accent/20 hover:border-transparent'
                    }`}
                  >
                    {isMember ? 'Enter Room' : 'Join Class'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreateClass onClose={() => setShowCreate(false)} />}
    </div>
  );
}
