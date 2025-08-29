import { 
  StudySession, 
  Subject, 
  Assignment, 
  StudyGoal, 
  UserSettings, 
  TimerSettings 
} from './types';

// Storage keys
const STORAGE_KEYS = {
  SESSIONS: 'studyx_sessions',
  SUBJECTS: 'studyx_subjects',
  ASSIGNMENTS: 'studyx_assignments',
  GOALS: 'studyx_goals',
  SETTINGS: 'studyx_settings',
  LAST_BACKUP: 'studyx_last_backup'
} as const;

// Default settings
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  notifications: true,
  soundEnabled: true
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  notifications: {
    assignments: true,
    sessions: true,
    goals: true,
    breaks: true
  },
  timer: DEFAULT_TIMER_SETTINGS,
  defaultSubject: '',
  weekStartsOn: 1
};

// Generic storage utilities
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      
      // Handle date strings conversion
      if (Array.isArray(parsed)) {
        return parsed.map(item => convertDates(item)) as T;
      } else {
        return convertDates(parsed) as T;
      }
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

// Date conversion utility
function convertDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // Check if string matches ISO date format
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertDates);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Convert specific date fields
      if (['startTime', 'endTime', 'dueDate', 'deadline', 'createdAt', 'completedAt'].includes(key)) {
        converted[key] = value ? new Date(value as string) : null;
      } else {
        converted[key] = convertDates(value);
      }
    }
    return converted;
  }
  
  return obj;
}

// Specific data access functions
export const sessionStorage = {
  getAll: (): StudySession[] => storage.get(STORAGE_KEYS.SESSIONS, []),
  
  save: (session: StudySession): void => {
    const sessions = sessionStorage.getAll();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    storage.set(STORAGE_KEYS.SESSIONS, sessions);
  },
  
  delete: (sessionId: string): void => {
    const sessions = sessionStorage.getAll().filter(s => s.id !== sessionId);
    storage.set(STORAGE_KEYS.SESSIONS, sessions);
  },
  
  getByDateRange: (startDate: Date, endDate: Date): StudySession[] => {
    const sessions = sessionStorage.getAll();
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  },
  
  getBySubject: (subjectId: string): StudySession[] => {
    return sessionStorage.getAll().filter(s => s.subjectId === subjectId);
  }
};

export const subjectStorage = {
  getAll: (): Subject[] => storage.get(STORAGE_KEYS.SUBJECTS, []),
  
  save: (subject: Subject): void => {
    const subjects = subjectStorage.getAll();
    const existingIndex = subjects.findIndex(s => s.id === subject.id);
    
    if (existingIndex >= 0) {
      subjects[existingIndex] = subject;
    } else {
      subjects.push(subject);
    }
    
    storage.set(STORAGE_KEYS.SUBJECTS, subjects);
  },
  
  delete: (subjectId: string): void => {
    const subjects = subjectStorage.getAll().filter(s => s.id !== subjectId);
    storage.set(STORAGE_KEYS.SUBJECTS, subjects);
  },
  
  getById: (subjectId: string): Subject | undefined => {
    return subjectStorage.getAll().find(s => s.id === subjectId);
  }
};

export const assignmentStorage = {
  getAll: (): Assignment[] => storage.get(STORAGE_KEYS.ASSIGNMENTS, []),
  
  save: (assignment: Assignment): void => {
    const assignments = assignmentStorage.getAll();
    const existingIndex = assignments.findIndex(a => a.id === assignment.id);
    
    if (existingIndex >= 0) {
      assignments[existingIndex] = assignment;
    } else {
      assignments.push(assignment);
    }
    
    storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
  },
  
  delete: (assignmentId: string): void => {
    const assignments = assignmentStorage.getAll().filter(a => a.id !== assignmentId);
    storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
  },
  
  getBySubject: (subjectId: string): Assignment[] => {
    return assignmentStorage.getAll().filter(a => a.subjectId === subjectId);
  },
  
  getOverdue: (): Assignment[] => {
    const now = new Date();
    return assignmentStorage.getAll().filter(a => 
      a.status !== 'completed' && new Date(a.dueDate) < now
    );
  },
  
  getUpcoming: (days: number = 7): Assignment[] => {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    
    return assignmentStorage.getAll().filter(a => 
      a.status !== 'completed' && 
      new Date(a.dueDate) >= now && 
      new Date(a.dueDate) <= future
    );
  }
};

export const goalStorage = {
  getAll: (): StudyGoal[] => storage.get(STORAGE_KEYS.GOALS, []),
  
  save: (goal: StudyGoal): void => {
    const goals = goalStorage.getAll();
    const existingIndex = goals.findIndex(g => g.id === goal.id);
    
    if (existingIndex >= 0) {
      goals[existingIndex] = goal;
    } else {
      goals.push(goal);
    }
    
    storage.set(STORAGE_KEYS.GOALS, goals);
  },
  
  delete: (goalId: string): void => {
    const goals = goalStorage.getAll().filter(g => g.id !== goalId);
    storage.set(STORAGE_KEYS.GOALS, goals);
  },
  
  getActive: (): StudyGoal[] => {
    return goalStorage.getAll().filter(g => !g.isCompleted && new Date(g.deadline) > new Date());
  }
};

export const settingsStorage = {
  get: (): UserSettings => storage.get(STORAGE_KEYS.SETTINGS, DEFAULT_USER_SETTINGS),
  
  save: (settings: UserSettings): void => {
    storage.set(STORAGE_KEYS.SETTINGS, settings);
  },
  
  reset: (): void => {
    storage.set(STORAGE_KEYS.SETTINGS, DEFAULT_USER_SETTINGS);
  }
};

// Data backup and restore
export const backup = {
  export: () => {
    const data = {
      sessions: sessionStorage.getAll(),
      subjects: subjectStorage.getAll(),
      assignments: assignmentStorage.getAll(),
      goals: goalStorage.getAll(),
      settings: settingsStorage.get(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  },
  
  import: (backupData: string): boolean => {
    try {
      const data = JSON.parse(backupData);
      
      if (data.sessions) storage.set(STORAGE_KEYS.SESSIONS, data.sessions);
      if (data.subjects) storage.set(STORAGE_KEYS.SUBJECTS, data.subjects);
      if (data.assignments) storage.set(STORAGE_KEYS.ASSIGNMENTS, data.assignments);
      if (data.goals) storage.set(STORAGE_KEYS.GOALS, data.goals);
      if (data.settings) storage.set(STORAGE_KEYS.SETTINGS, data.settings);
      
      storage.set(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error importing backup data:', error);
      return false;
    }
  }
};

// Utility functions
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};