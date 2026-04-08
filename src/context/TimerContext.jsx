import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const TimerContext = createContext();

export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [subject, setSubject] = useState('DSA');
  const [startTime, setStartTime] = useState(null);
  
  const timerRef = useRef(null);

  // Mock user for demo as requested
  const userId = "user_demo_001";
  const classIdRef = useRef(null); // Keep track of current classId

  const resetLocalTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsed(0);
    setStartTime(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startStudying = async (classId) => {
    classIdRef.current = classId;
    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);
    setIsPaused(false);
    
    // Start local tick
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    // Update Firestore to show user is studying
    try {
      const memberRef = doc(db, 'classMembers', `${classId}_${userId}`);
      await updateDoc(memberRef, {
        isStudying: true,
        startTime: now // saving local timestamp for easiest real-time syncing client side
      });
    } catch (e) {
      console.error("Error starting study session:", e);
    }
  };

  const pauseStudying = () => {
    setIsPaused(true);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    // Note: specifically requested NOT to update Firestore isStudying on pause (local pause only)
  };

  const resumeStudying = () => {
    setIsPaused(false);
    setIsRunning(true);
    // Re-adjust start time mathematically to account for paused duration
    // Actually, simple way: we already have elapsed in seconds.
    // If we resume, and we pretend we started (now - elapsed*1000) ago.
    const newStartTime = Date.now() - (elapsed * 1000);
    setStartTime(newStartTime);
    
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stopStudying = async (currentTodayTime) => {
    if (!isRunning && !isPaused) return;

    if (timerRef.current) clearInterval(timerRef.current);
    
    const durationSeconds = elapsed;
    const cid = classIdRef.current;
    
    // Format payload
    try {
      const newTotal = (currentTodayTime || 0) + durationSeconds;
      const memberRef = doc(db, 'classMembers', `${cid}_${userId}`);
      
      await updateDoc(memberRef, {
        isStudying: false,
        todayTime: newTotal
      });

      await addDoc(collection(db, 'sessions'), {
        userId,
        classId: cid,
        subject,
        startTime: startTime, 
        endTime: Date.now(),
        duration: durationSeconds,
        timestamp: serverTimestamp()
      });
      
    } catch (e) {
      console.error("Error stopping study session:", e);
    }

    resetLocalTimer();
    return durationSeconds;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <TimerContext.Provider value={{
      isRunning,
      isPaused,
      elapsed,
      subject,
      setSubject,
      startStudying,
      pauseStudying,
      resumeStudying,
      stopStudying
    }}>
      {children}
    </TimerContext.Provider>
  );
};
