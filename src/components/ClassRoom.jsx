import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Users, Copy, Check } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import StudyTimer from './StudyTimer';
import LiveMembers from './LiveMembers';
import Leaderboard from './Leaderboard';
import { triggerToast } from './Toast';
import { useTimer } from '../context/TimerContext';
import { useApp } from '../context/AppContext';

export default function ClassRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stopStudying, isRunning, isPaused } = useTimer();
  const { userId } = useApp();

  const [classData, setClassData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Daily reset check
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const checkDailyReset = async () => {
      try {
        const metaDocRef = doc(db, 'meta', 'dailyReset');
        const metaDoc = await getDoc(metaDocRef);
        if (metaDoc.exists()) {
          const dbDate = metaDoc.data().lastResetDate;
          if (dbDate !== todayStr) {
            await updateDoc(metaDocRef, { lastResetDate: todayStr });
          }
        }
      } catch(e) {}
    };
    checkDailyReset();
  }, []);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const d = await getDoc(doc(db, 'classes', id));
        if (d.exists()) {
          setClassData({ id: d.id, ...d.data() });
        } else {
          navigate('/');
        }
      } catch(e) {
        navigate('/');
      }
    };
    fetchClass();

    const q = query(collection(db, 'classMembers'), where('classId', '==', id));
    const unsub = onSnapshot(q, (snap) => {
      const ms = snap.docs.map(doc => doc.data());
      if (!ms.find(m => m.userId === userId)) {
        navigate('/');
        return;
      }
      setMembers(ms);
      setLoading(false);
    });

    return () => unsub();
  }, [id, navigate, userId]);

  const handleCopyCode = () => {
    if (classData?.code) {
      navigator.clipboard.writeText(classData.code);
      setCopied(true);
      triggerToast('Copied!', 'info');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentMember = members.find(m => m.userId === userId);
  const currentTodayTime = currentMember?.todayTime || 0;

  const handleBack = async () => {
    if (isRunning || isPaused) {
      await stopStudying(currentTodayTime);
    }
    navigate('/');
  };

  const handleLeaveClass = async () => {
    if (isRunning || isPaused) {
      await stopStudying(currentTodayTime);
    }
    try {
      await deleteDoc(doc(db, 'classMembers', `${id}_${userId}`));
      triggerToast('Left class');
      navigate('/');
    } catch(e) {
      console.error(e);
    }
  };

  if (loading || !classData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p>Loading Class Room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-brand-surface rounded-xl text-slate-400 hover:text-white transition-colors border border-transparent hover:border-brand-border"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
              {classData.name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Users size={14} className="text-brand-accent" />
                {members.length}
              </span>
              <span className="opacity-40">•</span>
              <span className="font-mono bg-brand-surface px-2 py-0.5 rounded-md flex items-center gap-1 border border-brand-border text-xs">
                {classData.code}
                <button onClick={handleCopyCode} className="ml-1 hover:text-white">
                  {copied ? <Check size={11}/> : <Copy size={11}/>}
                </button>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLeaveClass}
          className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl transition-all font-medium flex gap-2 items-center text-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* Timer Section */}
      <StudyTimer classId={id} currentTodayTime={currentTodayTime} />

      {/* Dashboard Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <LiveMembers members={members} />
        <Leaderboard members={members} />
      </div>
    </div>
  );
}
