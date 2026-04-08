import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, ShieldCheck, Key, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { triggerToast } from './Toast';

export default function LoginPage() {
  const { login } = useApp();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup' | 'otp'
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill all fields.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      triggerToast('Logged in safely!', 'success');
      login(data.user);
    } catch (err) {
      setError(err.message);
      triggerToast('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !username) {
      setError('Please fill all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) throw new Error(data.errors[0].message);
        throw new Error(data.message || 'Signup failed');
      }
      
      triggerToast('Code sent to email!', 'success');
      setActiveTab('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP Verification failed');
      
      triggerToast('Verification successful! You can now login.', 'success');
      setActiveTab('login');
      setPassword(''); // Clear password field for login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-accent to-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-2xl shadow-brand-accent/20">
            <LogIn size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">One Tap Study</h1>
          <p className="text-slate-400">Secure AES-256 Encrypted Portal</p>
        </div>

        <div className="bg-brand-card/80 backdrop-blur-xl border border-brand-border rounded-3xl p-8 shadow-2xl">
          
          {/* Tabs */}
          {activeTab !== 'otp' && (
            <div className="flex p-1 bg-brand-bg border border-brand-border rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'login' ? 'bg-brand-card text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'signup' ? 'bg-brand-card text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6 animate-fade-in text-center font-medium">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    placeholder="student@university.edu"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Secure Login'}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Display Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    placeholder="StudyNinja"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    placeholder="student@university.edu"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    required
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Create Account'}
              </button>
            </form>
          )}

          {/* OTP VERIFICATION */}
          {activeTab === 'otp' && (
            <form onSubmit={handleOTP} className="space-y-6 animate-fade-in-scale">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-accent/30 text-brand-accent">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Verify Your Email</h3>
                <p className="text-sm text-slate-400">
                  We sent a 6-digit verification code to <br/>
                  <strong className="text-white">{email}</strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block text-center">Auth Code</label>
                <div className="relative max-w-[200px] mx-auto">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent/50" size={18} />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-brand-bg border-2 border-brand-accent/50 rounded-xl py-4 pl-12 pr-4 text-white font-mono text-center text-2xl tracking-[10px] focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/20 transition-all outline-none"
                    placeholder="------"
                    required
                  />
                </div>
                <p className="text-center text-xs text-slate-500 mt-4">Code expires in 10 minutes</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-brand-success hover:bg-green-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-success/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Verify & Continue'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="mt-8 text-center text-xs font-medium text-slate-500 flex items-center justify-center gap-2">
          <Shield size={14} />
          End-to-End Encrypted Connection • Tap2Gyaan
        </div>
      </div>
    </div>
  );
}
