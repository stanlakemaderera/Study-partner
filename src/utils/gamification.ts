import confetti from 'canvas-confetti';
import { Badge, FocusSession, UserProfile } from '../types';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_spark',
    title: 'First Spark',
    description: 'Complete your very first focused study block.',
    iconName: 'Sparkles',
    category: 'focus',
    requirement: '1 completed session'
  },
  {
    id: 'deep_diver',
    title: 'Deep Diver',
    description: 'Complete a single uninterrupted session of 50 minutes or more.',
    iconName: 'Compass',
    category: 'focus',
    requirement: '50+ min focus block'
  },
  {
    id: 'century_scholar',
    title: 'Century Scholar',
    description: 'Accumulate 100+ minutes of total focused study time.',
    iconName: 'Award',
    category: 'mastery',
    requirement: '100 total study minutes'
  },
  {
    id: 'streak_initiator',
    title: 'Streak Initiator',
    description: 'Maintain a 3-day continuous study streak.',
    iconName: 'Flame',
    category: 'streak',
    requirement: '3-day study streak'
  },
  {
    id: 'unstoppable_force',
    title: 'Unstoppable Force',
    description: 'Maintain a 7-day study streak. Discipline has become your default.',
    iconName: 'Zap',
    category: 'streak',
    requirement: '7-day study streak'
  },
  {
    id: 'night_owl',
    title: 'Midnight Scholar',
    description: 'Complete a deep focus session during evening or night hours (after 8 PM).',
    iconName: 'Moon',
    category: 'focus',
    requirement: 'Session completed after 8 PM'
  },
  {
    id: 'dawn_patrol',
    title: 'Dawn Patrol',
    description: 'Conquer a study session before 8:00 AM.',
    iconName: 'Sun',
    category: 'focus',
    requirement: 'Session completed before 8 AM'
  },
  {
    id: 'zen_mind',
    title: 'Zen Practitioner',
    description: 'Complete 3 restorative break activities (breathing, stretching, or mind resets).',
    iconName: 'Heart',
    category: 'wellness',
    requirement: '3 completed break activities'
  },
  {
    id: 'study_circle',
    title: 'Study Lounge Peer',
    description: 'Participate in a real-time collaborative study room session.',
    iconName: 'Users',
    category: 'social',
    requirement: 'Study in a live room'
  },
  {
    id: 'exam_architect',
    title: 'Exam Architect',
    description: 'Set up an exam countdown and track syllabus milestones.',
    iconName: 'Calendar',
    category: 'mastery',
    requirement: 'Create exam countdown'
  }
];

export function calculateLevel(xp: number): { level: number; title: string; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  // Level progression curve: 200 XP for Level 1, then grows
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 150)) + 1);
  const currentBaseXp = Math.floor(Math.pow(level - 1, 2) * 150);
  const nextLevelXp = Math.floor(Math.pow(level, 2) * 150);
  const range = Math.max(1, nextLevelXp - currentBaseXp);
  const progressPercent = Math.min(100, Math.max(0, Math.round(((xp - currentBaseXp) / range) * 100)));

  const titles = [
    'Novice Inquirer',
    'Focused Apprentice',
    'Cognitive Builder',
    'Deep Work Adept',
    'Disciplined Polymath',
    'Master Scholar',
    'Archmage of Focus'
  ];

  const title = titles[Math.min(level - 1, titles.length - 1)];

  return {
    level,
    title,
    currentLevelXp: xp - currentBaseXp,
    nextLevelXp: range,
    progressPercent
  };
}

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#ec4899']
    });
  } catch (e) {
    console.debug('Confetti error:', e);
  }
}

export function checkNewBadges(
  profile: UserProfile,
  latestSession?: FocusSession,
  allSessions: FocusSession[] = []
): { updatedProfile: UserProfile; newlyUnlocked: Badge[] } {
  const unlocked = new Set(profile.unlockedBadgeIds || []);
  const newlyUnlocked: Badge[] = [];

  const addBadge = (badgeId: string) => {
    if (!unlocked.has(badgeId)) {
      unlocked.add(badgeId);
      const b = ALL_BADGES.find(x => x.id === badgeId);
      if (b) newlyUnlocked.push(b);
    }
  };

  // 1. First Spark
  if (profile.totalSessions >= 1) {
    addBadge('first_spark');
  }

  // 2. Deep Diver (50+ min session)
  if (latestSession && latestSession.durationMinutes >= 50 && latestSession.completed) {
    addBadge('deep_diver');
  } else if (allSessions.some(s => s.durationMinutes >= 50 && s.completed)) {
    addBadge('deep_diver');
  }

  // 3. Century Scholar (100+ total focus minutes)
  if (profile.totalFocusMinutes >= 100) {
    addBadge('century_scholar');
  }

  // 4. Streak Initiator
  if (profile.currentStreak >= 3) {
    addBadge('streak_initiator');
  }

  // 5. Unstoppable Force
  if (profile.currentStreak >= 7) {
    addBadge('unstoppable_force');
  }

  // 6. Night Owl
  if (latestSession) {
    const hour = new Date(latestSession.endTime).getHours();
    if (hour >= 20 || hour < 4) {
      addBadge('night_owl');
    }
  }

  // 7. Dawn Patrol
  if (latestSession) {
    const hour = new Date(latestSession.startTime).getHours();
    if (hour >= 4 && hour < 8) {
      addBadge('dawn_patrol');
    }
  }

  // 8. Zen Practitioner
  if (profile.breakActivitiesDone >= 3) {
    addBadge('zen_mind');
  }

  const updatedProfile: UserProfile = {
    ...profile,
    unlockedBadgeIds: Array.from(unlocked)
  };

  return { updatedProfile, newlyUnlocked };
}
