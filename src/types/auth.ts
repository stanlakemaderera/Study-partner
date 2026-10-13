import { ExamCountdown, FocusSession, Goal, UserProfile } from './index';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserAccountData {
  user: AuthUser;
  passwordHash: string;
  profile: UserProfile;
  sessions: FocusSession[];
  goals: Goal[];
  exams: ExamCountdown[];
  subjects: string[];
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  browserNotificationsEnabled: boolean;
  sessionEndReminders: boolean;
  breakReminders: boolean;
  examDeadlineAlerts: boolean;
  periodicNudges: boolean;
  nudgeIntervalMinutes: number; // e.g. 25, 30, 45
  quietHoursStart?: string; // HH:MM
  quietHoursEnd?: string;   // HH:MM
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string; // ISO
  type: 'session' | 'exam' | 'streak' | 'break' | 'system';
  read: boolean;
  actionUrl?: string;
}
