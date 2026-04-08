import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { triggerToast } from './Toast';
import { useApp } from '../context/AppContext';

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function CreateClass({ onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userId, username } = useApp();

  useEffect(() => { setCode(generateCode()); }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    triggerToast('Copied!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const classRef = await addDoc(collection(db, 'classes'), {
        name, description, code,
        createdBy: userId,
        isPublic,
        createdAt: serverTimestamp()
      });
      const memberRef = doc(db, 'classMembers', `${classRef.id}_${userId}`);
      await setDoc(memberRef, {
        classId: classRef.id,
        userId, username,
        todayTime: 0,
        isStudying: false,
        startTime: null
      });
      triggerToast('Class created!');
      onClose();
      navigate(`/room/${classRef.id}`);
    } catch (error) {
      console.error("Error creating class:", error);
      triggerToast('Failed to create class', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-brand-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-brand-border animate-fade-in-scale">
        <div className="px-6 py-4 flex justify-between items-center border-b border-brand-border">
          <h2 className="text-xl font-bold text-white">Create Class</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Class Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-brand-bg text-white border border-brand-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              placeholder="e.g., Late Night Coders"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="w-full bg-brand-bg text-white border border-brand-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all resize-none"
              placeholder="Optional description"
            ></textarea>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Public Class</label>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-brand-accent' : 'bg-slate-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Class Code</label>
            <div className="flex bg-brand-bg text-white border border-brand-border rounded-xl overflow-hidden">
              <input
                type="text"
                value={code}
                readOnly
                className="w-full bg-transparent px-4 py-2.5 outline-none font-mono tracking-wider font-bold text-lg"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 text-brand-accent hover:bg-brand-surface transition-colors flex items-center gap-2 font-medium"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-brand-accent/20"
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
