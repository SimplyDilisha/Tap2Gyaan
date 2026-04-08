import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are Gyaan AI, an intelligent and friendly study assistant for the "One Tap Study" platform. Your role is to help students with:

1. **Academic Questions**: Answer questions about any subject - Math, Science, History, Programming, Languages, etc.
2. **Study Tips**: Provide effective study strategies, memory techniques, and time management advice.
3. **Concept Explanations**: Break down complex topics into simple, easy-to-understand explanations.
4. **Quiz Preparation**: Help students prepare for quizzes and exams with practice questions.
5. **Interview Prep**: Assist with interview preparation, resume tips, and career guidance.
6. **Motivation**: Encourage students and help them stay motivated in their learning journey.

Guidelines:
- Keep responses concise but comprehensive
- Use examples when explaining concepts
- Be encouraging and supportive
- Format responses with markdown when helpful (bullet points, bold, etc.)
- If you don't know something, admit it honestly
- Always maintain an educational and positive tone`;

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! 👋 I'm **Gyaan AI**, your study buddy! Ask me anything about your subjects, study tips, interview prep, or just need help understanding a concept. I'm here to help you learn! 📚✨"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0).map(m => ({
              role: m.role,
              content: m.content
            })),
            { role: 'user', content: userMessage.content }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again."
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops! 😅 I'm having trouble connecting right now. Please check your internet connection and try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! 🧹 How can I help you with your studies today?"
    }]);
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-brand-border px-1.5 py-0.5 rounded text-brand-accent text-sm">$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 lg:bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-brand-accent to-amber-500 rounded-full shadow-lg shadow-brand-accent/30 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-brand-bg animate-pulse" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 lg:bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[70vh] bg-brand-card border border-brand-border rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-gradient-to-r from-brand-accent/10 to-transparent rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-amber-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Gyaan AI</h3>
              <p className="text-xs text-slate-400">Your Study Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 animate-fade-in ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                message.role === 'user'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-brand-accent/20 text-brand-accent'
              }`}>
                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-blue-500/20 text-blue-100 rounded-tr-sm'
                  : 'bg-brand-surface text-slate-200 rounded-tl-sm'
              }`}>
                <div
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-brand-accent/20 text-brand-accent flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-brand-surface px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-brand-border">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-accent transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 bg-gradient-to-br from-brand-accent to-amber-500 rounded-xl flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            Powered by Groq • Press Enter to send
          </p>
        </div>
      </div>
    </>
  );
}
