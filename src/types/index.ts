export type TimerMode = 'focus_sprint' | 'pomodoro' | 'short_break' | 'long_break' | 'deep_work' | 'custom' | 'stopwatch';

export interface FocusSession {
  id: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  durationMinutes: number;
  subject: string;
  topic?: string;
  notes?: string;
  rating?: number; // 1-5
  mode: TimerMode;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  type: 'daily_hours' | 'weekly_subject' | 'exam_milestone';
  targetMinutes: number;
  currentMinutes: number;
  subject?: string;
  deadline?: string;
  completed: boolean;
}

export interface ExamTopic {
  id: string;
  name: string;
  completed: boolean;
}

export interface ExamCountdown {
  id: string;
  title: string;
  subject: string;
  date: string; // ISO date-time
  targetGrade?: string;
  notes?: string;
  topics: ExamTopic[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'streak' | 'focus' | 'social' | 'wellness' | 'mastery';
  unlockedAt?: string;
  requirement: string;
}

export interface UserProfile {
  name: string;
  credits: string; // "Created by Stanlake T.Maderera"
  avatar: string;
  xp: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  dailyGoalMinutes: number;
  totalFocusMinutes: number;
  totalSessions: number;
  breakActivitiesDone: number;
  glassesOfWater: number;
  unlockedBadgeIds: string[];
}

export interface RoomPeer {
  id: string;
  name: string;
  avatar: string;
  subject: string;
  state: 'focusing' | 'break' | 'idle';
  minutesFocusedToday: number;
  streak: number;
  lastActive: string;
  isSelf?: boolean;
}

export interface RoomReaction {
  id: string;
  peerName: string;
  emoji: string;
  text: string;
  timestamp: number;
}

export interface StudyRoom {
  id: string;
  name: string;
  category: 'library' | 'cafe' | 'lofi' | 'cram' | 'custom';
  description: string;
  ambientSoundSuggested?: 'rain' | 'whitenoise' | 'binaural' | 'stream' | 'none';
  peers: RoomPeer[];
}

export type ActiveTab = 'timer' | 'analytics' | 'goals' | 'social' | 'breaks' | 'exams';
