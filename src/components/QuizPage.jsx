import React, { useState, useEffect, useRef } from 'react';
import { Brain, Check, X, Clock, RotateCcw, ChevronRight, Trophy, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

const QUESTION_BANK = {
  'Data Structures': [
    { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
    { q: 'Which data structure uses FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correct: 1 },
    { q: 'What is the worst case for quicksort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 2 },
    { q: 'Which structure is used in BFS?', options: ['Stack', 'Queue', 'Heap', 'Array'], correct: 1 },
    { q: 'Hash table average lookup time?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correct: 2 },
  ],
  'JavaScript': [
    { q: 'What does "===" check?', options: ['Value only', 'Type only', 'Value and type', 'Reference'], correct: 2 },
    { q: 'What is a closure?', options: ['A loop construct', 'Function + lexical scope', 'An object type', 'Error handler'], correct: 1 },
    { q: 'Which is NOT a primitive type?', options: ['string', 'number', 'object', 'boolean'], correct: 2 },
    { q: 'What does Promise.all() do?', options: ['Runs first promise', 'Runs all, resolves when all done', 'Cancels all', 'Chains promises'], correct: 1 },
    { q: '"typeof null" returns?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correct: 2 },
  ],
  'System Design': [
    { q: 'What is horizontal scaling?', options: ['Adding CPU', 'Adding more machines', 'Adding RAM', 'Adding disk'], correct: 1 },
    { q: 'What does CAP theorem stand for?', options: ['Cache, API, Protocol', 'Consistency, Availability, Partition', 'Compute, Access, Performance', 'None'], correct: 1 },
    { q: 'Purpose of a load balancer?', options: ['Store data', 'Distribute traffic', 'Encrypt data', 'Cache results'], correct: 1 },
    { q: 'What is sharding?', options: ['Data replication', 'Data partitioning', 'Data encryption', 'Data compression'], correct: 1 },
    { q: 'CDN stands for?', options: ['Central Data Node', 'Content Delivery Network', 'Cloud Data Network', 'Compute Distribution Node'], correct: 1 },
  ],
  'General Knowledge': [
    { q: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Tech Transfer Protocol', 'HyperText Tech Process', 'None'], correct: 0 },
    { q: 'What is an API?', options: ['A programming language', 'Application Programming Interface', 'A protocol', 'A database'], correct: 1 },
    { q: 'SQL is used for?', options: ['Styling', 'Scripting', 'Database queries', 'Networking'], correct: 2 },
    { q: 'Git is a?', options: ['Language', 'Database', 'Version control system', 'Framework'], correct: 2 },
    { q: 'What does DNS resolve?', options: ['IP to name', 'Name to IP', 'Port to IP', 'Name to port'], correct: 1 },
  ],
};

const TOPICS = Object.keys(QUESTION_BANK);

export default function QuizPage() {
  const { addXP } = useApp();
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(15);
  const timerRef = useRef(null);

  const startQuiz = (t) => {
    setTopic(t);
    const shuffled = [...QUESTION_BANK[t]].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setTimer(15);
  };

  useEffect(() => {
    if (topic && !finished && !answered) {
      setTimer(15);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setAnswered(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [currentQ, topic, finished, answered]);

  const handleAnswer = (idx) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(idx);
    setAnswered(true);
    if (idx === questions[currentQ].correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      addXP(score * 20);
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const reset = () => {
    setTopic(null);
    setQuestions([]);
    setFinished(false);
  };

  // Topic selection
  if (!topic) {
    return (
      <div className="page-enter max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-black text-white mb-2">Quizzes</h1>
        <p className="text-slate-400 text-sm mb-8">Test your knowledge and earn XP</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOPICS.map(t => (
            <button
              key={t}
              onClick={() => startQuiz(t)}
              className="bg-brand-card border border-brand-border rounded-2xl p-6 text-left hover:border-brand-accent hover:shadow-lg hover:shadow-brand-accent/10 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/15 flex items-center justify-center">
                  <Brain size={20} className="text-brand-accent" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-accent transition-colors">{t}</h3>
              </div>
              <p className="text-sm text-slate-400">{QUESTION_BANK[t].length} questions • 15s each</p>
              <div className="mt-4 flex items-center gap-1 text-brand-accent text-sm font-medium">
                Start Quiz <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Results
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="page-enter max-w-lg mx-auto px-4 text-center">
        <div className="bg-brand-card border border-brand-border rounded-2xl p-8">
          <div className="w-20 h-20 rounded-full bg-brand-accent/15 flex items-center justify-center mx-auto mb-5">
            <Trophy size={36} className="text-brand-accent" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Quiz Complete!</h2>
          <p className="text-slate-400 mb-6">{topic}</p>

          <div className="text-6xl font-black text-brand-accent mb-2">{pct}%</div>
          <div className="text-slate-400 mb-6">{score} / {questions.length} correct</div>

          <div className="bg-brand-bg border border-brand-border rounded-xl p-4 mb-6 flex items-center justify-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            <span className="font-bold text-white">+{score * 20} XP earned</span>
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 bg-brand-card border border-brand-border text-white py-3 rounded-xl font-medium hover:border-slate-600 transition-all">
              Back to Topics
            </button>
            <button onClick={() => startQuiz(topic)} className="flex-1 bg-brand-accent text-white py-3 rounded-xl font-bold hover:bg-brand-accent-hover transition-all flex items-center justify-center gap-2">
              <RotateCcw size={16} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz question
  const q = questions[currentQ];
  return (
    <div className="page-enter max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={reset} className="text-sm text-slate-400 hover:text-white transition-colors">← Back</button>
        <span className="text-sm text-slate-400 font-medium">{currentQ + 1} / {questions.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-brand-border rounded-full mb-6">
        <div className="h-full bg-brand-accent rounded-full transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Timer */}
      <div className="flex justify-center mb-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold
          ${timer <= 5 ? 'bg-red-500/15 text-red-400' : 'bg-brand-card text-slate-300 border border-brand-border'}`}>
          <Clock size={14} />
          {timer}s
        </div>
      </div>

      {/* Question */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white leading-relaxed">{q.q}</h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {q.options.map((opt, idx) => {
          let cls = 'bg-brand-card border border-brand-border text-slate-300 hover:border-slate-500';
          if (answered) {
            if (idx === q.correct) cls = 'bg-green-500/15 border border-green-500/50 text-green-400';
            else if (idx === selected && idx !== q.correct) cls = 'bg-red-500/15 border border-red-500/50 text-red-400';
            else cls = 'bg-brand-card border border-brand-border text-slate-500 opacity-50';
          } else if (selected === idx) {
            cls = 'bg-brand-accent/15 border border-brand-accent text-brand-accent';
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={answered}
              className={`w-full p-4 rounded-xl text-left font-medium transition-all flex items-center gap-3 ${cls}`}
            >
              <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
              {answered && idx === q.correct && <Check size={18} className="ml-auto text-green-400" />}
              {answered && idx === selected && idx !== q.correct && <X size={18} className="ml-auto text-red-400" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <button onClick={nextQuestion} className="w-full bg-brand-accent text-white py-3.5 rounded-xl font-bold hover:bg-brand-accent-hover transition-all flex items-center justify-center gap-2 animate-fade-in">
          {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question'}
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
