import React, { useState } from 'react';
import { Briefcase, RefreshCw, Eye, EyeOff, Clock, ChevronRight, MessageSquare, Code, Users2 } from 'lucide-react';

const CATEGORIES = {
  Behavioral: {
    icon: Users2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    questions: [
      { q: 'Tell me about a time you showed leadership.', a: 'Use the STAR method: Situation, Task, Action, Result. Focus on a specific instance where you took initiative, delegated tasks, and achieved a measurable outcome.' },
      { q: 'Describe a conflict with a coworker and how you resolved it.', a: 'Show empathy and problem-solving. Explain you listened to their perspective, found common ground, and reached a compromise that benefited the team.' },
      { q: 'What is your greatest weakness?', a: 'Be honest but strategic. Choose a real weakness, explain what you\'ve done to improve, and show self-awareness without disqualifying yourself.' },
      { q: 'Why should we hire you?', a: 'Connect your unique skills to the role requirements. Give specific examples of past achievements that directly relate to what the position needs.' },
      { q: 'Where do you see yourself in 5 years?', a: 'Show ambition aligned with the company. Express desire to grow, take on more responsibility, and contribute meaningfully to the organization\'s goals.' },
    ]
  },
  Technical: {
    icon: Code,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    questions: [
      { q: 'Explain the difference between REST and GraphQL.', a: 'REST uses multiple endpoints with fixed data structures. GraphQL uses a single endpoint where clients specify exactly what data they need, reducing over-fetching.' },
      { q: 'What is the difference between SQL and NoSQL databases?', a: 'SQL databases are relational, use structured schemas, and support ACID transactions. NoSQL databases are non-relational, schema-flexible, and optimized for horizontal scaling.' },
      { q: 'Explain the concept of Big O notation.', a: 'Big O describes algorithm efficiency as input grows. O(1) is constant, O(log n) is logarithmic, O(n) is linear, O(n²) is quadratic. It helps compare algorithm performance.' },
      { q: 'What is a microservices architecture?', a: 'An approach where an application is built as a collection of small, independent services that communicate via APIs. Each service is deployable, scalable, and maintainable independently.' },
      { q: 'Explain how HTTPS works.', a: 'HTTPS uses TLS/SSL to encrypt HTTP traffic. It involves a handshake where server presents a certificate, client verifies it, they agree on encryption keys, then all data is encrypted.' },
    ]
  },
  HR: {
    icon: MessageSquare,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    questions: [
      { q: 'What motivates you at work?', a: 'Focus on intrinsic motivators: solving challenging problems, learning new skills, making meaningful impact, and collaborating with talented people.' },
      { q: 'How do you handle pressure and stress?', a: 'Describe specific strategies: prioritization, breaking tasks into smaller parts, taking breaks, and maintaining perspective on what\'s truly urgent vs important.' },
      { q: 'What are your salary expectations?', a: 'Research market rates beforehand. Give a range based on your experience and the role. Express flexibility and focus on the total compensation package.' },
      { q: 'Tell me about yourself.', a: 'Give a 2-minute professional summary: current role, key achievements, relevant skills, and why you\'re excited about this opportunity. Keep it focused and compelling.' },
      { q: 'Do you have any questions for us?', a: 'Always have 2-3 thoughtful questions ready about team culture, growth opportunities, current challenges, or the company\'s technical vision.' },
    ]
  }
};

export default function InterviewPrep() {
  const [category, setCategory] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  const startCategory = (cat) => {
    setCategory(cat);
    setCurrentIdx(0);
    setShowAnswer(false);
    setAnsweredCount(0);
  };

  const nextQuestion = () => {
    const qs = CATEGORIES[category].questions;
    if (currentIdx + 1 < qs.length) {
      setCurrentIdx(prev => prev + 1);
      setShowAnswer(false);
      setAnsweredCount(prev => prev + 1);
    }
  };

  const shuffle = () => {
    const qs = CATEGORIES[category].questions;
    setCurrentIdx(Math.floor(Math.random() * qs.length));
    setShowAnswer(false);
  };

  // Category selection
  if (!category) {
    return (
      <div className="page-enter max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-black text-white mb-2">Interview Prep</h1>
        <p className="text-slate-400 text-sm mb-8">Practice with common interview questions</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(CATEGORIES).map(([name, cat]) => {
            const Icon = cat.icon;
            return (
              <button
                key={name}
                onClick={() => startCategory(name)}
                className="bg-brand-card border border-brand-border rounded-2xl p-6 text-left hover:border-brand-accent hover:shadow-lg hover:shadow-brand-accent/10 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-4`}>
                  <Icon size={24} className={cat.color} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand-accent transition-colors">{name}</h3>
                <p className="text-sm text-slate-400">{cat.questions.length} questions</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const catData = CATEGORIES[category];
  const q = catData.questions[currentIdx];

  return (
    <div className="page-enter max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCategory(null)} className="text-sm text-slate-400 hover:text-white transition-colors">← Categories</button>
        <span className="text-sm text-slate-400">{currentIdx + 1} / {catData.questions.length}</span>
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 ${catData.bg} ${catData.color}`}>
        <catData.icon size={12} />
        {category}
      </div>

      {/* Question card */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 mb-4">
        <h3 className="text-xl font-bold text-white leading-relaxed">{q.q}</h3>
      </div>

      {/* Answer card (flip) */}
      <div
        onClick={() => setShowAnswer(!showAnswer)}
        className={`bg-brand-surface border rounded-2xl p-6 mb-6 cursor-pointer transition-all ${showAnswer ? 'border-brand-accent/30' : 'border-brand-border hover:border-slate-600'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {showAnswer ? 'Model Answer' : 'Tap to reveal answer'}
          </span>
          {showAnswer ? <EyeOff size={14} className="text-slate-400" /> : <Eye size={14} className="text-slate-400" />}
        </div>
        {showAnswer ? (
          <p className="text-slate-300 leading-relaxed animate-fade-in">{q.a}</p>
        ) : (
          <div className="h-16 flex items-center justify-center">
            <div className="text-4xl opacity-20">🤔</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button onClick={shuffle} className="flex-1 bg-brand-card border border-brand-border text-slate-300 py-3 rounded-xl font-medium hover:border-slate-600 transition-all flex items-center justify-center gap-2">
          <RefreshCw size={16} /> Random
        </button>
        <button
          onClick={nextQuestion}
          className="flex-1 bg-brand-accent text-white py-3 rounded-xl font-bold hover:bg-brand-accent-hover transition-all flex items-center justify-center gap-2"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
