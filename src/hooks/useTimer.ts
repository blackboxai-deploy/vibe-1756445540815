'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState, TimerMode, StudySession } from '@/lib/types';
import { generateId } from '@/lib/storage';

export interface UseTimerOptions {
  focusTime: number; // in minutes
  shortBreak: number; // in minutes
  longBreak: number; // in minutes
  longBreakInterval: number; // after how many focus sessions
  onSessionComplete?: (session: StudySession) => void;
  onBreakComplete?: () => void;
}

export function useTimer({
  focusTime = 25,
  shortBreak = 5,
  longBreak = 15,
  longBreakInterval = 4,
  onSessionComplete,
  onBreakComplete
}: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentMode, setCurrentMode] = useState<TimerMode>('focus');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Calculate initial time based on current mode
  const getInitialTime = useCallback((mode: TimerMode) => {
    switch (mode) {
      case 'focus':
        return focusTime * 60;
      case 'short-break':
        return shortBreak * 60;
      case 'long-break':
        return longBreak * 60;
      default:
        return focusTime * 60;
    }
  }, [focusTime, shortBreak, longBreak]);

  // Start timer
  const startTimer = useCallback((subjectId?: string, notes?: string) => {
    if (timerState === 'running') return;

    // If starting a focus session, create a new study session
    if (currentMode === 'focus' && timerState === 'idle') {
      const session: StudySession = {
        id: generateId(),
        subject: '', // Will be filled when subject is available
        subjectId: subjectId || '',
        duration: 0,
        startTime: new Date(),
        endTime: null,
        notes: notes || '',
        date: new Date().toISOString().split('T')[0],
        isCompleted: false,
        type: 'focus'
      };
      setCurrentSession(session);
      startTimeRef.current = new Date();
    }

    setTimerState('running');
    
    intervalRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          // Timer completed
          setTimerState('completed');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [timerState, currentMode]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (timerState !== 'running') return;

    setTimerState('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Track paused time for accurate session recording
    if (startTimeRef.current) {
      pausedTimeRef.current += Date.now() - startTimeRef.current.getTime();
    }
  }, [timerState]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (timerState !== 'paused') return;
    
    startTimeRef.current = new Date();
    startTimer();
  }, [timerState, startTimer]);

  // Stop/Reset timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimerState('idle');
    setTimeLeft(getInitialTime(currentMode));
    setCurrentSession(null);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [currentMode, getInitialTime]);

  // Complete current session and move to next mode
  const completeSession = useCallback(() => {
    if (currentSession && currentMode === 'focus') {
      const completedSession: StudySession = {
        ...currentSession,
        duration: focusTime * 60,
        endTime: new Date(),
        isCompleted: true
      };
      
      onSessionComplete?.(completedSession);
      setCompletedSessions(prev => prev + 1);
    }

    if (currentMode === 'focus') {
      // Move to break
      const isLongBreak = (completedSessions + 1) % longBreakInterval === 0;
      const nextMode = isLongBreak ? 'long-break' : 'short-break';
      setCurrentMode(nextMode);
      setTimeLeft(getInitialTime(nextMode));
    } else {
      // Move back to focus
      setCurrentMode('focus');
      setTimeLeft(getInitialTime('focus'));
      onBreakComplete?.();
    }

    setTimerState('idle');
    setCurrentSession(null);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [
    currentSession, 
    currentMode, 
    focusTime, 
    completedSessions, 
    longBreakInterval, 
    onSessionComplete, 
    onBreakComplete, 
    getInitialTime
  ]);

  // Skip current session
  const skipSession = useCallback(() => {
    completeSession();
  }, [completeSession]);

  // Reset all progress
  const resetProgress = useCallback(() => {
    stopTimer();
    setCompletedSessions(0);
    setCurrentMode('focus');
    setTimeLeft(getInitialTime('focus'));
  }, [stopTimer, getInitialTime]);

  // Handle timer completion
  useEffect(() => {
    if (timerState === 'completed') {
      completeSession();
    }
  }, [timerState, completeSession]);

  // Update time when mode or settings change
  useEffect(() => {
    if (timerState === 'idle') {
      setTimeLeft(getInitialTime(currentMode));
    }
  }, [currentMode, focusTime, shortBreak, longBreak, timerState, getInitialTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Calculate progress percentage
  const progress = useMemo(() => {
    const totalTime = getInitialTime(currentMode);
    return ((totalTime - timeLeft) / totalTime) * 100;
  }, [timeLeft, currentMode, getInitialTime]);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    timeLeft,
    timerState,
    currentMode,
    completedSessions,
    currentSession,
    progress,
    
    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipSession,
    resetProgress,
    completeSession,
    
    // Helpers
    formatTime: formatTime(timeLeft),
    isRunning: timerState === 'running',
    isPaused: timerState === 'paused',
    isCompleted: timerState === 'completed',
    isIdle: timerState === 'idle',
    isFocusMode: currentMode === 'focus',
    isBreakMode: currentMode !== 'focus',
    nextBreakType: (completedSessions + 1) % longBreakInterval === 0 ? 'long-break' : 'short-break'
  };
}

import { useMemo } from 'react';