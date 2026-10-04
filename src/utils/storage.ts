import { ExamCountdown, FocusSession, Goal, UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'stanlake_focus_profile_v1',
  SESSIONS: 'stanlake_focus_sessions_v1',
  GOALS: 'stanlake_focus_goals_v1',
  EXAMS: 'stanlake_focus_exams_v1',
  SUBJECTS: 'stanlake_focus_subjects_v1',
  THEME: 'stanlake_focus_theme_v1',
};

export const DEFAULT_SUBJECTS = [
  'Mathematics',
  'Computer Science',
  'Biology',
  'Physics',
  'Chemistry',
  'Literature',
  'Law & Ethics',
  'Economics',
  'General Study'
];

export function loadSubjects(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) return DEFAULT_SUBJECTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_SUBJECTS;
  } catch {
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Error saving subjects:', e);
  }
}

// Default initial starter state
const DEFAULT_PROFILE: UserProfile = {
  name: 'Stanlake Scholar',
  credits: 'Created by Stanlake T.Maderera',
  avatar: '👨‍🎓',
  xp: 480,
  level: 2,
  currentStreak: 4,
  bestStreak: 6,
  lastStudyDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
  dailyGoalMinutes: 120, // 2 hours
  totalFocusMinutes: 245,
  totalSessions: 7,
  breakActivitiesDone: 4,
  glassesOfWater: 3,
  unlockedBadgeIds: ['first_spark', 'streak_initiator']
};

// Seed realistic previous sessions so analytics charts look rich immediately
function getInitialSessions(): FocusSession[] {
  const now = new Date();
  const daysAgo = (days: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'sess-1',
      startTime: daysAgo(3, 9),
      endTime: daysAgo(3, 9),
      durationMinutes: 45,
      subject: 'Mathematics',
      topic: 'Multivariable Derivatives',
      notes: 'Reviewed chain rule and directional gradients. Solved problem set 3.',
      rating: 5,
      mode: 'pomodoro',
      completed: true
    },
    {
      id: 'sess-2',
      startTime: daysAgo(3, 14),
      endTime: daysAgo(3, 14),
      durationMinutes: 30,
      subject: 'Computer Science',
      topic: 'Graph Algorithms & BFS',
      notes: 'Implemented topological sort & cycle detection in DAGs.',
      rating: 4,
      mode: 'pomodoro',
      completed: true
    },
    {
      id: 'sess-3',
      startTime: daysAgo(2, 10),
      endTime: daysAgo(2, 10),
      durationMinutes: 50,
      subject: 'Biology',
      topic: 'Cellular Respiration & Krebs Cycle',
      notes: 'Memorized ATP synthesis steps and electron transport chain complexes.',
      rating: 5,
      mode: 'deep_work',
      completed: true
    },
    {
      id: 'sess-4',
      startTime: daysAgo(2, 16),
      endTime: daysAgo(2, 16),
      durationMinutes: 25,
      subject: 'Mathematics',
      topic: 'Lagrange Multipliers',
      notes: 'Constrained optimization exercises.',
      rating: 4,
      mode: 'pomodoro',
      completed: true
    },
    {
      id: 'sess-5',
      startTime: daysAgo(1, 11),
      endTime: daysAgo(1, 11),
      durationMinutes: 45,
      subject: 'Physics',
      topic: 'Electromagnetism & Maxwell Equations',
      notes: 'Deep derivation of Faraday law in integral and differential forms.',
      rating: 5,
      mode: 'pomodoro',
      completed: true
    },
    {
      id: 'sess-6',
      startTime: daysAgo(1, 19),
      endTime: daysAgo(1, 19),
      durationMinutes: 50,
      subject: 'Computer Science',
      topic: 'Dynamic Programming',
      notes: 'Knapsack variants and memoization patterns.',
      rating: 4,
      mode: 'deep_work',
      completed: true
    }
  ];
}

const DEFAULT_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Daily Deep Focus Target',
    type: 'daily_hours',
    targetMinutes: 120,
    currentMinutes: 45,
    completed: false
  },
  {
    id: 'goal-2',
    title: 'Master Calculus Problem Sets',
    type: 'weekly_subject',
    targetMinutes: 180,
    currentMinutes: 120,
    subject: 'Mathematics',
    completed: false
  },
  {
    id: 'goal-3',
    title: 'Review Biology Exam Question Bank',
    type: 'weekly_subject',
    targetMinutes: 120,
    currentMinutes: 75,
    subject: 'Biology',
    completed: false
  }
];

function getInitialExams(): ExamCountdown[] {
  const now = new Date();
  const exam1Date = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000); // 18 days from now
  const exam2Date = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000); // 35 days from now

  return [
    {
      id: 'exam-1',
      title: 'Final Examination: Advanced Calculus',
      subject: 'Mathematics',
      date: exam1Date.toISOString(),
      targetGrade: 'A / 90%+',
      notes: 'Hall 4B, 09:00 AM. Formulas sheet provided.',
      topics: [
        { id: 'top-1', name: 'Vector Calculus & Green Theorem', completed: true },
        { id: 'top-2', name: 'Stokes & Divergence Theorems', completed: true },
        { id: 'top-3', name: 'Differential Forms & Manifolds', completed: false },
        { id: 'top-4', name: 'Past Paper 2024 & 2025 Mock Drills', completed: false }
      ]
    },
    {
      id: 'exam-2',
      title: 'Molecular Biology & Genetics Finals',
      subject: 'Biology',
      date: exam2Date.toISOString(),
      targetGrade: 'A* Distinction',
      notes: 'Covers Chapters 8 through 16.',
      topics: [
        { id: 'top-5', name: 'DNA Replication & Polymerase mechanisms', completed: true },
        { id: 'top-6', name: 'CRISPR Cas-9 & Gene editing protocols', completed: false },
        { id: 'top-7', name: 'Population Genetics & Hardy-Weinberg equilibrium', completed: false }
      ]
    }
  ];
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed, credits: 'Created by Stanlake T.Maderera' };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export function loadSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      const initial = getInitialSessions();
      saveSessions(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialSessions();
  }
}

export function saveSessions(sessions: FocusSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving sessions:', e);
  }
}

export function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) return DEFAULT_GOALS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GOALS;
  }
}

export function saveGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Error saving goals:', e);
  }
}

export function loadExams(): ExamCountdown[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) {
      const initial = getInitialExams();
      saveExams(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialExams();
  }
}

export function saveExams(exams: ExamCountdown[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  } catch (e) {
    console.error('Error saving exams:', e);
  }
}
