import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import JoinClass from './components/JoinClass';
import ClassRoom from './components/ClassRoom';
import PomodoroTimer from './components/PomodoroTimer';
import QuizPage from './components/QuizPage';
import InterviewPrep from './components/InterviewPrep';
import NotesPage from './components/NotesPage';
import PlannerPage from './components/PlannerPage';
import BookInsights from './components/BookInsights';
import CalendarPage from './components/CalendarPage';
import TimetablePage from './components/TimetablePage';
import ReportsPage from './components/ReportsPage';
import GamificationPage from './components/GamificationPage';
import SettingsPage from './components/SettingsPage';
import Toast from './components/Toast';

function App() {
  const { user } = useApp();
  const location = useLocation();

  // Show login if no user
  if (!user) {
    return (
      <>
        <LoginPage />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />

      {/* Main content area — pushed right on desktop for sidebar */}
      <main className="lg:ml-[72px] pb-20 lg:pb-0 min-h-screen">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<JoinClass />} />
            <Route path="/room/:id" element={<ClassRoom />} />
            <Route path="/pomodoro" element={<PomodoroTimer />} />
            <Route path="/quizzes" element={<QuizPage />} />
            <Route path="/interview" element={<InterviewPrep />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/books" element={<BookInsights />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/gamification" element={<GamificationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Toast />
    </div>
  );
}

export default App;
