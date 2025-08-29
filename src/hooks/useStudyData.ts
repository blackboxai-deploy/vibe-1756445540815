'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  StudySession,
  Subject,
  Assignment,
  StudyGoal,
  StudyStats,
  SubjectProgress,
  UserSettings
} from '@/lib/types';
import {
  sessionStorage,
  subjectStorage,
  assignmentStorage,
  goalStorage,
  settingsStorage,
  generateId
} from '@/lib/storage';

export function useStudyData() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [settings, setSettings] = useState<UserSettings>(settingsStorage.get());
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      setSessions(sessionStorage.getAll());
      setSubjects(subjectStorage.getAll());
      setAssignments(assignmentStorage.getAll());
      setGoals(goalStorage.getAll());
      setSettings(settingsStorage.get());
    } catch (error) {
      console.error('Error loading study data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Session management
  const addSession = (session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: generateId()
    };
    
    sessionStorage.save(newSession);
    setSessions(prev => [...prev, newSession]);
    
    // Update subject total time
    const subject = subjects.find(s => s.id === session.subjectId);
    if (subject) {
      const updatedSubject = {
        ...subject,
        totalTime: subject.totalTime + session.duration
      };
      updateSubject(updatedSubject);
    }
  };

  const updateSession = (updatedSession: StudySession) => {
    sessionStorage.save(updatedSession);
    setSessions(prev => 
      prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
  };

  const deleteSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      sessionStorage.delete(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // Update subject total time
      const subject = subjects.find(s => s.id === session.subjectId);
      if (subject) {
        const updatedSubject = {
          ...subject,
          totalTime: Math.max(0, subject.totalTime - session.duration)
        };
        updateSubject(updatedSubject);
      }
    }
  };

  // Subject management
  const addSubject = (subject: Omit<Subject, 'id' | 'totalTime' | 'createdAt'>) => {
    const newSubject: Subject = {
      ...subject,
      id: generateId(),
      totalTime: 0,
      createdAt: new Date(),
      isActive: true
    };
    
    subjectStorage.save(newSubject);
    setSubjects(prev => [...prev, newSubject]);
    return newSubject;
  };

  const updateSubject = (updatedSubject: Subject) => {
    subjectStorage.save(updatedSubject);
    setSubjects(prev => 
      prev.map(subject => 
        subject.id === updatedSubject.id ? updatedSubject : subject
      )
    );
  };

  const deleteSubject = (subjectId: string) => {
    subjectStorage.delete(subjectId);
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    
    // Also delete related sessions and assignments
    sessions.filter(s => s.subjectId === subjectId).forEach(s => {
      sessionStorage.delete(s.id);
    });
    setSessions(prev => prev.filter(s => s.subjectId !== subjectId));
    
    assignments.filter(a => a.subjectId === subjectId).forEach(a => {
      assignmentStorage.delete(a.id);
    });
    setAssignments(prev => prev.filter(a => a.subjectId !== subjectId));
  };

  // Assignment management
  const addAssignment = (assignment: Omit<Assignment, 'id' | 'createdAt' | 'completedAt' | 'actualTime'>) => {
    const subject = subjects.find(s => s.id === assignment.subjectId);
    const newAssignment: Assignment = {
      ...assignment,
      id: generateId(),
      subject: subject?.name || '',
      createdAt: new Date(),
      completedAt: null,
      actualTime: 0
    };
    
    assignmentStorage.save(newAssignment);
    setAssignments(prev => [...prev, newAssignment]);
    return newAssignment;
  };

  const updateAssignment = (updatedAssignment: Assignment) => {
    assignmentStorage.save(updatedAssignment);
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === updatedAssignment.id ? updatedAssignment : assignment
      )
    );
  };

  const deleteAssignment = (assignmentId: string) => {
    assignmentStorage.delete(assignmentId);
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };

  const completeAssignment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      const updatedAssignment = {
        ...assignment,
        status: 'completed' as const,
        completedAt: new Date()
      };
      updateAssignment(updatedAssignment);
    }
  };

  // Goal management
  const addGoal = (goal: Omit<StudyGoal, 'id' | 'current' | 'createdAt' | 'isCompleted'>) => {
    const newGoal: StudyGoal = {
      ...goal,
      id: generateId(),
      current: 0,
      isCompleted: false,
      createdAt: new Date()
    };
    
    goalStorage.save(newGoal);
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = (updatedGoal: StudyGoal) => {
    goalStorage.save(updatedGoal);
    setGoals(prev => 
      prev.map(goal => 
        goal.id === updatedGoal.id ? updatedGoal : goal
      )
    );
  };

  const deleteGoal = (goalId: string) => {
    goalStorage.delete(goalId);
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Settings management
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    settingsStorage.save(updatedSettings);
    setSettings(updatedSettings);
  };

  // Analytics and computed data
  const studyStats = useMemo((): StudyStats => {
    const totalStudyTime = sessions.reduce((total, session) => total + session.duration, 0);
    const totalSessions = sessions.length;
    const averageSessionLength = totalSessions > 0 ? totalStudyTime / totalSessions : 0;
    
    // Calculate streak days
    const today = new Date();
    const sortedSessions = sessions
      .map(s => new Date(s.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streakDays = 0;
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);
    
    for (const sessionDate of sortedSessions) {
      const sessionDay = new Date(sessionDate);
      sessionDay.setHours(0, 0, 0, 0);
      
      if (sessionDay.getTime() === currentDate.getTime()) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDay.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const achievedGoals = goals.filter(g => g.isCompleted).length;
    
    // Find most productive hour
    const hourCounts = sessions.reduce((acc, session) => {
      const hour = new Date(session.startTime).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const mostProductiveHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '9';
    
    // Find favorite subject
    const subjectTimes = sessions.reduce((acc, session) => {
      acc[session.subjectId] = (acc[session.subjectId] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteSubjectId = Object.entries(subjectTimes)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '';
    
    const favoriteSubject = subjects.find(s => s.id === favoriteSubjectId)?.name || 'None';
    
    return {
      totalStudyTime,
      totalSessions,
      averageSessionLength,
      streakDays,
      completedAssignments,
      achievedGoals,
      mostProductiveHour: parseInt(mostProductiveHour),
      favoriteSubject
    };
  }, [sessions, assignments, goals, subjects]);

  const subjectProgress = useMemo((): SubjectProgress[] => {
    return subjects.map(subject => {
      const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
      const studyTime = subject.totalTime;
      const sessionCount = subjectSessions.length;
      const avgSessionLength = sessionCount > 0 ? studyTime / sessionCount : 0;
      const goalHours = subject.goalHours * 3600; // Convert to seconds
      const percentage = goalHours > 0 ? Math.min((studyTime / goalHours) * 100, 100) : 0;
      
      return {
        subjectId: subject.id,
        name: subject.name,
        color: subject.color,
        studyTime,
        goalHours: subject.goalHours,
        percentage,
        sessions: sessionCount,
        avgSessionLength
      };
    });
  }, [subjects, sessions]);

  const upcomingAssignments = useMemo(() => {
    return assignments
      .filter(a => a.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [assignments]);

  const overdueAssignments = useMemo(() => {
    const now = new Date();
    return assignments.filter(a => 
      a.status !== 'completed' && new Date(a.dueDate) < now
    );
  }, [assignments]);

  const activeGoals = useMemo(() => {
    return goals.filter(g => !g.isCompleted && new Date(g.deadline) > new Date());
  }, [goals]);

  return {
    // Data
    sessions,
    subjects,
    assignments,
    goals,
    settings,
    isLoading,
    
    // Actions
    addSession,
    updateSession,
    deleteSession,
    addSubject,
    updateSubject,
    deleteSubject,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    completeAssignment,
    addGoal,
    updateGoal,
    deleteGoal,
    updateSettings,
    
    // Computed data
    studyStats,
    subjectProgress,
    upcomingAssignments,
    overdueAssignments,
    activeGoals,
    
    // Helpers
    getSubjectById: (id: string) => subjects.find(s => s.id === id),
    getSessionsBySubject: (subjectId: string) => sessions.filter(s => s.subjectId === subjectId),
    getSessionsByDateRange: (start: Date, end: Date) => 
      sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= start && sessionDate <= end;
      })
  };
}