import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Trash2, Sparkles, User, Copy, Check, Plus, MessageSquare, ChevronLeft, Clock, X } from 'lucide-react';
import { triggerToast } from './Toast';

const CONVERSATIONS_KEY = 'ots_ai_conversations';
const ACTIVE_CHAT_KEY = 'ots_ai_active_chat';

const loadConversations = () => {
  try {
    const saved = localStorage.getItem(CONVERSATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveConversations = (conversations) => {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations.slice(0, 50))); // Keep last 50 conversations
};

const loadActiveChat = () => {
  try {
    return localStorage.getItem(ACTIVE_CHAT_KEY) || null;
  } catch {
    return null;
  }
};

const saveActiveChat = (chatId) => {
  if (chatId) {
    localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
  } else {
    localStorage.removeItem(ACTIVE_CHAT_KEY);
  }
};

const generateChatTitle = (messages) => {
  if (messages.length === 0) return 'New Chat';
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  const title = firstUserMessage.content.slice(0, 40);
  return title.length < firstUserMessage.content.length ? title + '...' : title;
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return date.toLocaleDateString();
};

export default function AIChatbot() {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeChatId, setActiveChatId] = useState(loadActiveChat);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load messages for active chat
  useEffect(() => {
    if (activeChatId) {
      const chat = conversations.find(c => c.id === activeChatId);
      setMessages(chat?.messages || []);
    } else {
      setMessages([]);
    }
  }, [activeChatId, conversations]);

  // Save active chat ID
  useEffect(() => {
    saveActiveChat(activeChatId);
  }, [activeChatId]);

  // Save conversations
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update conversation when messages change
  const updateConversation = (newMessages) => {
    if (newMessages.length === 0) return;
    
    const now = Date.now();
    
    if (activeChatId) {
      // Update existing conversation
      setConversations(prev => prev.map(c => 
        c.id === activeChatId 
          ? { ...c, messages: newMessages, updatedAt: now, title: generateChatTitle(newMessages) }
          : c
      ));
    } else {
      // Create new conversation
      const newChat = {
        id: now.toString(),
        title: generateChatTitle(newMessages),
        messages: newMessages,
        createdAt: now,
        updatedAt: now
      };
      setConversations(prev => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { id: Date.now(), role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: messages.slice(-10)
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to get response');

      const aiMessage = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: data.response 
      };
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      updateConversation(finalMessages);
    } catch (err) {
      triggerToast(err.message || 'Failed to get AI response', 'error');
      setMessages(messages); // Revert to previous messages
      setInput(userMessage.content);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setShowHistory(false);
  };

  const loadChat = (chatId) => {
    setActiveChatId(chatId);
    setShowHistory(false);
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
    triggerToast('Chat deleted', 'success');
  };

  const clearAllHistory = () => {
    setConversations([]);
    setActiveChatId(null);
    setMessages([]);
    localStorage.removeItem(CONVERSATIONS_KEY);
    localStorage.removeItem(ACTIVE_CHAT_KEY);
    triggerToast('All chats cleared', 'success');
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      triggerToast('Failed to copy', 'error');
    }
  };

  const suggestedQuestions = [
    "Explain binary search algorithm",
    "What is the Pythagorean theorem?",
    "How does photosynthesis work?",
    "Solve: 2x + 5 = 15",
  ];

  return (
    <div className="page-enter max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-accent to-blue-400 flex items-center justify-center shadow-lg shadow-brand-accent/20">
              <Bot className="w-4 h-4 text-white" />
            </span>
            AI Study Assistant
          </h1>
          <p className="text-slate-400 text-sm">Ask any question and get instant answers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all ${
              showHistory 
                ? 'bg-brand-accent text-white' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">History</span>
            {conversations.length > 0 && (
              <span className="bg-brand-accent/20 text-brand-accent text-xs px-1.5 py-0.5 rounded-md">
                {conversations.length}
              </span>
            )}
          </button>
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-brand-accent hover:bg-brand-accent-hover rounded-xl transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Chat History Sidebar */}
        {showHistory && (
          <div className="w-72 shrink-0 bg-brand-card border border-brand-border rounded-2xl overflow-hidden flex flex-col animate-fade-in" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>
            <div className="p-3 border-b border-brand-border flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Chat History</h3>
              {conversations.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                  No chat history yet
                </div>
              ) : (
                conversations.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all group ${
                      activeChatId === chat.id
                        ? 'bg-brand-accent/15 border border-brand-accent/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          activeChatId === chat.id ? 'text-white' : 'text-slate-300'
                        }`}>
                          {chat.title}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Clock size={10} />
                          {formatDate(chat.updatedAt)}
                          <span className="mx-1">•</span>
                          {chat.messages.length} msgs
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="flex-1 bg-brand-card border border-brand-border rounded-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-brand-accent" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">How can I help you today?</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-md">
                I can help with math problems, explain concepts, answer questions about any subject, and more!
              </p>
              
              {/* Suggested Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-left px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm text-slate-300 hover:border-brand-accent hover:text-white transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-brand-accent" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-brand-accent text-white rounded-br-md'
                          : 'bg-brand-bg border border-brand-border text-slate-200 rounded-bl-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="mt-1 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={12} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center shrink-0 order-2">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-brand-accent" />
                  </div>
                  <div className="bg-brand-bg border border-brand-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-brand-border bg-brand-surface/50">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={loading}
              className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-3 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Powered by AI • Responses may not always be accurate
          </p>
        </form>
      </div>
      </div>
    </div>
  );
}
