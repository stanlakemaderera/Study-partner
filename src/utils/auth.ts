import { AuthUser, UserAccountData, NotificationSettings } from '../types/auth';
import { 
  loadProfile, 
  loadSessions, 
  loadGoals, 
  loadExams, 
  loadSubjects,
  saveProfile,
  saveSessions,
  saveGoals,
  saveExams,
  saveSubjects
} from './storage';
import { DEFAULT_NOTIFICATION_SETTINGS, triggerNotification } from './notifications';

const STORAGE_KEY_ACCOUNTS = 'stanlake_accounts_v1';
const STORAGE_KEY_ACTIVE_USER = 'stanlake_active_user_v1';

// Seed demo account
const DEFAULT_DEMO_USER: AuthUser = {
  id: 'user-teekay-default',
  name: 'Teekay Maderera',
  email: 'tk@gmail.com',
  avatar: '👨‍🎓',
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  lastLoginAt: new Date().toISOString()
};

function getAccountsMap(): Record<string, UserAccountData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    let map: Record<string, UserAccountData> = {};
    if (raw) {
      map = JSON.parse(raw);
    }
    
    // Ensure Teekay Maderera account is always available as default demo account
    if (!map['tk@gmail.com']) {
      map['tk@gmail.com'] = {
        user: DEFAULT_DEMO_USER,
        passwordHash: 'focus2026',
        profile: { ...loadProfile(), name: 'Teekay Maderera' },
        sessions: loadSessions(),
        goals: loadGoals(),
        exams: loadExams(),
        subjects: loadSubjects(),
        notificationSettings: DEFAULT_NOTIFICATION_SETTINGS
      };
      saveAccountsMap(map);
    }
    return map;
  } catch {
    return {
      'tk@gmail.com': {
        user: DEFAULT_DEMO_USER,
        passwordHash: 'focus2026',
        profile: { ...loadProfile(), name: 'Teekay Maderera' },
        sessions: loadSessions(),
        goals: loadGoals(),
        exams: loadExams(),
        subjects: loadSubjects(),
        notificationSettings: DEFAULT_NOTIFICATION_SETTINGS
      }
    };
  }
}

function saveAccountsMap(map: Record<string, UserAccountData>): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save accounts database', e);
  }
}

export function getActiveUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
    }
  } catch (e) {
    console.error('Failed to update active user session', e);
  }
}

export function loginUser(email: string, password: string): { success: boolean; user?: AuthUser; error?: string } {
  const accounts = getAccountsMap();
  const cleanEmail = email.trim().toLowerCase();
  const account = accounts[cleanEmail];

  if (!account) {
    return { success: false, error: 'No account found with this email address. Please sign up.' };
  }

  if (account.passwordHash !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  // Update last login timestamp
  account.user.lastLoginAt = new Date().toISOString();
  accounts[cleanEmail] = account;
  saveAccountsMap(accounts);

  // Restore user-specific data into active storage
  saveProfile(account.profile);
  saveSessions(account.sessions);
  saveGoals(account.goals);
  saveExams(account.exams);
  saveSubjects(account.subjects);

  setActiveUser(account.user);

  triggerNotification(
    `Welcome back, ${account.user.name}!`,
    'Your study session history and exam countdowns are fully synchronized.',
    'system'
  );

  return { success: true, user: account.user };
}

export function registerUser(name: string, email: string, password: string): { success: boolean; user?: AuthUser; error?: string } {
  const accounts = getAccountsMap();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  if (accounts[cleanEmail]) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const newUser: AuthUser = {
    id: 'user-' + Date.now(),
    name: name.trim() || 'Dedicated Scholar',
    email: cleanEmail,
    avatar: '🎓',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  const initialProfile = {
    ...loadProfile(),
    name: newUser.name,
    avatar: newUser.avatar,
    xp: 100,
    level: 1,
    currentStreak: 1,
    totalFocusMinutes: 0,
    totalSessions: 0
  };

  const newAccount: UserAccountData = {
    user: newUser,
    passwordHash: password,
    profile: initialProfile,
    sessions: [],
    goals: loadGoals(),
    exams: loadExams(),
    subjects: loadSubjects(),
    notificationSettings: DEFAULT_NOTIFICATION_SETTINGS
  };

  accounts[cleanEmail] = newAccount;
  saveAccountsMap(accounts);

  // Set active
  saveProfile(newAccount.profile);
  saveSessions(newAccount.sessions);
  saveGoals(newAccount.goals);
  saveExams(newAccount.exams);
  saveSubjects(newAccount.subjects);
  setActiveUser(newUser);

  triggerNotification(
    `Account Created for ${newUser.name}`,
    'Your personalized study room, streak tracker, and exam countdowns are ready.',
    'system'
  );

  return { success: true, user: newUser };
}

export function syncUserDataToAccount(
  user: AuthUser,
  profile: any,
  sessions: any[],
  goals: any[],
  exams: any[],
  subjects: string[]
): void {
  const accounts = getAccountsMap();
  const cleanEmail = user.email.toLowerCase();
  if (accounts[cleanEmail]) {
    accounts[cleanEmail].profile = profile;
    accounts[cleanEmail].sessions = sessions;
    accounts[cleanEmail].goals = goals;
    accounts[cleanEmail].exams = exams;
    accounts[cleanEmail].subjects = subjects;
    saveAccountsMap(accounts);
  }
}

export function logoutUser(): void {
  setActiveUser(null);
}
