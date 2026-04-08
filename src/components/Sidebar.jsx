import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Users, Timer, Brain, Briefcase, StickyNote, ListChecks, BookOpen,
  CalendarDays, Clock3, BarChart3, Trophy, Settings, LogOut, Menu, X,
  Flame
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Users, label: 'Study Rooms' },
  { path: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { path: '/quizzes', icon: Brain, label: 'Quizzes' },
  { path: '/interview', icon: Briefcase, label: 'Interview' },
  { path: '/notes', icon: StickyNote, label: 'Notes' },
  { path: '/planner', icon: ListChecks, label: 'Planner' },
  { path: '/books', icon: BookOpen, label: 'Books' },
  { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { path: '/timetable', icon: Clock3, label: 'Timetable' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/gamification', icon: Trophy, label: 'Gamification' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, username, xp, sidebarOpen, setSidebarOpen, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-brand-card border border-brand-border p-2.5 rounded-xl text-slate-300 hover:text-white hover:border-brand-accent transition-all"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-40 bg-brand-card/80 backdrop-blur-xl border-r border-brand-border flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-[72px] lg:hover:w-64'}
        group/sidebar`}
      >
        {/* Brand */}
        <div className="px-4 py-5 border-b border-brand-border flex items-center gap-3 min-h-[68px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-accent to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-accent/20">
            <Flame size={18} className="text-white" />
          </div>
          <span className={`font-black text-white text-lg whitespace-nowrap overflow-hidden transition-all duration-300
            ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:w-auto'}`}>
            One Tap Study
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto custom-scrollbar space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const isRoomActive = item.path === '/' && (location.pathname === '/' || location.pathname.startsWith('/room'));

            const active = isActive || isRoomActive;

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                  ${active
                    ? 'bg-brand-accent/15 text-brand-accent shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={19} className={`shrink-0 ${active ? 'text-brand-accent' : ''}`} />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300
                  ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:w-auto'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-accent to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className={`flex-1 overflow-hidden transition-all duration-300
              ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:w-auto'}`}>
              <div className="text-sm font-semibold text-white truncate">{username}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Trophy size={10} className="text-brand-accent" />
                <span>Lv.{level}</span>
                <div className="flex-1 h-1 bg-brand-border rounded-full max-w-[60px]">
                  <div className="h-full bg-brand-accent rounded-full transition-all" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav (compact) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-brand-card border-t border-brand-border flex justify-around py-2 px-1">
        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/room'));
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors text-[10px]
                ${isActive ? 'text-brand-accent' : 'text-slate-500'}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-slate-500 text-[10px]"
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </div>
    </>
  );
}
