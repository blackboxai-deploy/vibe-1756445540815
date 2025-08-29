// Core data models for StudyX

export interface StudySession {
  id: string;
  subject: string;
  subjectId: string;
  duration: number; // in seconds
  startTime: Date;
  endTime: Date | null;
  notes: string;
  date: string; // YYYY-MM-DD format
  isCompleted: boolean;
  type: 'focus' | 'break' | 'long-break';
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  description: string;
  totalTime: number; // in seconds
  goalHours: number;
  createdAt: Date;
  isActive: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subject: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  estimatedTime: number; // in hours
  actualTime: number; // in seconds
  createdAt: Date;
  completedAt: Date | null;
}

export interface StudyGoal {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'subject';
  target: number; // target value (hours, sessions, etc.)
  current: number; // current progress
  unit: 'hours' | 'sessions' | 'assignments';
  deadline: Date;
  subjectId?: string; // optional, for subject-specific goals
  isCompleted: boolean;
  createdAt: Date;
}

export interface TimerSettings {
  focusTime: number; // in minutes
  shortBreak: number; // in minutes
  longBreak: number; // in minutes
  longBreakInterval: number; // after how many focus sessions
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
  soundEnabled: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    assignments: boolean;
    sessions: boolean;
    goals: boolean;
    breaks: boolean;
  };
  timer: TimerSettings;
  defaultSubject: string;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

export interface StudyStats {
  totalStudyTime: number; // in seconds
  totalSessions: number;
  averageSessionLength: number; // in seconds
  streakDays: number;
  completedAssignments: number;
  achievedGoals: number;
  mostProductiveHour: number; // 0-23
  favoriteSubject: string;
}

export interface WeeklyData {
  date: string;
  studyTime: number;
  sessions: number;
  subjects: { [key: string]: number };
}

export interface SubjectProgress {
  subjectId: string;
  name: string;
  color: string;
  studyTime: number;
  goalHours: number;
  percentage: number;
  sessions: number;
  avgSessionLength: number;
}

// Timer states
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';
export type TimerMode = 'focus' | 'short-break' | 'long-break';

// UI States
export interface AppState {
  currentSession: StudySession | null;
  timerState: TimerState;
  timerMode: TimerMode;
  selectedSubject: Subject | null;
  isTimerVisible: boolean;
}

// Form types
export interface CreateSubjectForm {
  name: string;
  description: string;
  color: string;
  goalHours: number;
}

export interface CreateAssignmentForm {
  title: string;
  description: string;
  subjectId: string;
  dueDate: string;
  priority: Assignment['priority'];
  estimatedTime: number;
}

export interface CreateSessionForm {
  subjectId: string;
  duration: number;
  notes: string;
  date: string;
}

// Analytics types
export interface DailyStudyData {
  date: string;
  totalTime: number;
  sessions: StudySession[];
  subjects: { [subjectId: string]: number };
}

export interface MonthlyReport {
  month: string;
  totalTime: number;
  totalSessions: number;
  dailyAverage: number;
  topSubjects: Array<{
    subject: string;
    time: number;
    percentage: number;
  }>;
  goalProgress: Array<{
    goal: string;
    progress: number;
    target: number;
  }>;
}