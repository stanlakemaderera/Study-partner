import React, { useState, useEffect } from 'react';
import { 
  ActiveTab, 
  ExamCountdown as ExamCountdownType, 
  FocusSession, 
  Goal, 
  TimerMode, 
  UserProfile,
  Badge
} from './types';
import { 
  loadProfile, 
  saveProfile, 
  loadSessions, 
  saveSessions, 
  loadGoals, 
  saveGoals, 
  loadExams, 
  saveExams,
  loadSubjects,
  saveSubjects
} from './utils/storage';
import { checkNewBadges, fireCelebrationConfetti } from './utils/gamification';
import { soundEngine } from './utils/audio';

import { Header } from './components/Header';
import { FocusTimer } from './components/FocusTimer';
import { AnalyticsView } from './components/AnalyticsView';
import { GoalTracker } from './components/GoalTracker';
import { SocialStudyRoom } from './components/SocialStudyRoom';
import { BreakActivities } from './components/BreakActivities';
import { ExamCountdown } from './components/ExamCountdown';
import { ZenOverlay } from './components/ZenOverlay';
import { BadgesModal } from './components/BadgesModal';
import { CreditsModal } from './components/CreditsModal';

export default function App() {
  // Global State
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [sessions, setSessions] = useState<FocusSession[]>(loadSessions);
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [exams, setExams] = useState<ExamCountdownType[]>(loadExams);
  const [subjects, setSubjects] = useState<string[]>(loadSubjects);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('timer');
  const [isZenOpen, setIsZenOpen] = useState<boolean>(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState<boolean>(false);

  // Active Session context (Intuitive 'focus_sprint' replaces 'pomodoro')
  const [timerMode, setTimerMode] = useState<TimerMode>('focus_sprint');
  const [currentSubject, setCurrentSubject] = useState<string>(() => {
    const subs = loadSubjects();
    return subs.length > 0 ? subs[0] : 'Mathematics';
  });
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [ambientSound, setAmbientSound] = useState<string | null>(null);

  // User Subject Handlers
  const handleAddSubject = (newSub: string) => {
    const trimmed = newSub.trim();
    if (!trimmed) return;
    if (!subjects.includes(trimmed)) {
      const updated = [...subjects, trimmed];
      setSubjects(updated);
      saveSubjects(updated);
    }
    setCurrentSubject(trimmed);
  };

  const handleDeleteSubject = (subToDelete: string) => {
    if (subjects.length <= 1) {
      alert('You must have at least one study subject.');
      return;
    }
    const updated = subjects.filter(s => s !== subToDelete);
    setSubjects(updated);
    saveSubjects(updated);
    if (currentSubject === subToDelete && updated.length > 0) {
      setCurrentSubject(updated[0]);
    }
  };

  // Notification Toast for badges or achievements
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  // Auto-save on changes
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveExams(exams);
  }, [exams]);

  // Streak verification on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = profile.lastStudyDate;

    if (lastDate) {
      const last = new Date(lastDate);
      const cur = new Date(today);
      const diffDays = Math.round((cur.getTime() - last.getTime()) / (1000 * 3600 * 24));

      if (diffDays > 1) {
        // Streak broken
        setProfile(prev => ({ ...prev, currentStreak: 1, lastStudyDate: today }));
      }
    }
  }, []);

  const showNotificationToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handle completed focus session
  const handleSessionComplete = (newSession: FocusSession) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);

    // Calculate XP
    const xpGained = newSession.durationMinutes * 10 + 50;
    const newTotalFocus = profile.totalFocusMinutes + newSession.durationMinutes;
    const newTotalSessions = profile.totalSessions + 1;

    // Check streak
    let newStreak = profile.currentStreak;
    if (profile.lastStudyDate !== todayStr) {
      newStreak = profile.currentStreak + 1;
    }
    const newBestStreak = Math.max(profile.bestStreak, newStreak);

    let updatedProfile: UserProfile = {
      ...profile,
      xp: profile.xp + xpGained,
      totalFocusMinutes: newTotalFocus,
      totalSessions: newTotalSessions,
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      lastStudyDate: todayStr
    };

    // Check badges
    const { updatedProfile: profileWithBadges, newlyUnlocked } = checkNewBadges(
      updatedProfile,
      newSession,
      updatedSessions
    );

    setProfile(profileWithBadges);

    // Trigger celebration
    fireCelebrationConfetti();

    if (newlyUnlocked.length > 0) {
      const badge = newlyUnlocked[0];
      showNotificationToast(`Badge Unlocked: ${badge.title}!`, badge.description);
    } else {
      showNotificationToast(
        `Focus Block Complete! +${xpGained} XP`,
        `Logged ${newSession.durationMinutes}m of deep work in ${newSession.subject}.`
      );
    }
  };

  // Handle break activity completed
  const handleBreakActivityComplete = (activityName: string, xpEarned: number) => {
    const updatedProfile: UserProfile = {
      ...profile,
      xp: profile.xp + xpEarned,
      breakActivitiesDone: profile.breakActivitiesDone + 1,
      glassesOfWater: activityName.includes('Hydration') ? profile.glassesOfWater + 1 : profile.glassesOfWater
    };

    const { updatedProfile: finalProfile, newlyUnlocked } = checkNewBadges(updatedProfile);
    setProfile(finalProfile);

    fireCelebrationConfetti();
    if (newlyUnlocked.length > 0) {
      showNotificationToast(`Badge Unlocked: ${newlyUnlocked[0].title}!`, newlyUnlocked[0].description);
    } else {
      showNotificationToast(`Break Routine Finished! +${xpEarned} XP`, activityName);
    }
  };

  // Toggle ambient sound
  const handleToggleSound = () => {
    if (ambientSound) {
      soundEngine.stopAmbient();
      setAmbientSound(null);
    } else {
      soundEngine.playAmbient('rain');
      setAmbientSound('rain');
    }
  };

  // Today's total focus minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutes = sessions
    .filter(s => s.startTime.startsWith(todayStr))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* 3-Zone Clean Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenZen={() => setIsZenOpen(true)}
        onOpenCredits={() => setIsCreditsOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        ambientSound={ambientSound}
        onToggleSound={handleToggleSound}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'timer' && (
          <FocusTimer
            onSessionComplete={handleSessionComplete}
            onOpenZen={() => setIsZenOpen(true)}
            onOpenBreakHub={() => setActiveTab('breaks')}
            profile={profile}
            ambientSound={ambientSound}
            setAmbientSound={setAmbientSound}
            timerMode={timerMode}
            setTimerMode={setTimerMode}
            subject={currentSubject}
            setSubject={setCurrentSubject}
            topic={currentTopic}
            setTopic={setCurrentTopic}
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView sessions={sessions} profile={profile} />
        )}

        {activeTab === 'goals' && (
          <GoalTracker
            goals={goals}
            onUpdateGoals={setGoals}
            profile={profile}
            onUpdateProfile={setProfile}
            todayMinutes={todayMinutes}
            subjects={subjects}
          />
        )}

        {activeTab === 'social' && (
          <SocialStudyRoom
            profile={profile}
            currentSubject={currentSubject}
            onJoinRoomActivity={() => {
              const { updatedProfile } = checkNewBadges(profile);
              if (!profile.unlockedBadgeIds.includes('study_circle')) {
                const withSocial = {
                  ...updatedProfile,
                  unlockedBadgeIds: [...updatedProfile.unlockedBadgeIds, 'study_circle']
                };
                setProfile(withSocial);
                fireCelebrationConfetti();
                showNotificationToast('Badge Unlocked: Study Lounge Peer!', 'Participated in real-time study session.');
              }
            }}
          />
        )}

        {activeTab === 'breaks' && (
          <BreakActivities
            profile={profile}
            onActivityComplete={handleBreakActivityComplete}
          />
        )}

        {activeTab === 'exams' && (
          <ExamCountdown
            exams={exams}
            onUpdateExams={setExams}
            subjects={subjects}
            onUnlockBadge={(badgeId) => {
              if (!profile.unlockedBadgeIds.includes(badgeId)) {
                setProfile(prev => ({
                  ...prev,
                  unlockedBadgeIds: [...prev.unlockedBadgeIds, badgeId]
                }));
                showNotificationToast('Achievement Unlocked!', 'Mastered exam preparation milestones.');
              }
            }}
          />
        )}
      </main>

      {/* Clean Distraction-Free Footer */}
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-200">Stanlake Focus</span>
            <span>·</span>
            <span className="font-medium text-emerald-400">Created by Stanlake T.Maderera</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsZenOpen(true)}
              className="hover:text-neutral-200 transition-colors"
            >
              Zen Mode
            </button>
            <button
              onClick={() => setActiveTab('breaks')}
              className="hover:text-neutral-200 transition-colors"
            >
              Break Hub
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className="hover:text-neutral-200 transition-colors"
            >
              Study Lounge
            </button>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="hover:text-neutral-200 transition-colors"
            >
              Credits & About
            </button>
          </div>
        </div>
      </footer>

      {/* Zen Fullscreen Focus Overlay */}
      <ZenOverlay
        isOpen={isZenOpen}
        onClose={() => setIsZenOpen(false)}
        timerMode={timerMode}
        subject={currentSubject}
        topic={currentTopic}
        ambientSound={ambientSound}
        setAmbientSound={setAmbientSound}
        onSessionComplete={handleSessionComplete}
      />

      {/* Gamification & Badges Modal */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        profile={profile}
      />

      {/* Credits Modal */}
      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />

      {/* Celebration Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-600/80 bg-neutral-900 p-4 shadow-2xl max-w-sm animate-bounce-short">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-ping" />
            <div>
              <div className="text-xs font-semibold text-white">{toastMessage.title}</div>
              <div className="text-xs text-neutral-400 mt-0.5">{toastMessage.subtitle}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
