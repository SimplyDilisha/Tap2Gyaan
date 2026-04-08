import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('otsUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('otsTheme') || 'dark';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // XP / Gamification state
  const [xp, setXp] = useState(() => {
    return parseInt(localStorage.getItem('otsXP') || '0', 10);
  });

  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('otsAchievements');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) localStorage.setItem('otsUser', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('otsTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('otsXP', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('otsAchievements', JSON.stringify(achievements));
  }, [achievements]);

  const login = (username) => {
    const id = 'user_' + username.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36);
    const u = { id, username, createdAt: Date.now() };
    setUser(u);
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('otsUser');
  };

  const addXP = (amount) => {
    setXp(prev => prev + amount);
  };

  const unlockAchievement = (ach) => {
    setAchievements(prev => {
      if (prev.find(a => a.id === ach.id)) return prev;
      return [...prev, { ...ach, unlockedAt: Date.now() }];
    });
  };

  const resetAllData = () => {
    localStorage.clear();
    setUser(null);
    setXp(0);
    setAchievements([]);
    setTheme('dark');
  };

  const userId = user?.id || 'user_demo_001';
  const username = user?.username || 'Guest';

  return (
    <AppContext.Provider value={{
      user, userId, username,
      login, logout,
      theme, setTheme,
      sidebarOpen, setSidebarOpen,
      xp, addXP,
      achievements, unlockAchievement,
      resetAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};
