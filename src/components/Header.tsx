import React, { useState } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { AuthUser } from '../types/auth';
import { soundEngine } from '../utils/audio';
import { 
  Timer, 
  BarChart3, 
  Target, 
  Users, 
  Coffee, 
  CalendarClock, 
  Maximize2, 
  Flame, 
  Volume2, 
  VolumeX, 
  Award, 
  Info, 
  Bell, 
  LogOut, 
  ChevronDown, 
  Check, 
  X, 
  Plus, 
  Minus, 
  Sparkles 
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: UserProfile;
  todayMinutes: number;
  onUpdateDailyGoal: (targetMinutes: number) => void;
  user: AuthUser | null;
  onSignOut: () => void;
  onOpenZen: () => void;
  onOpenCredits: () => void;
  onOpenBadges: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  ambientSound: string | null;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  todayMinutes,
  onUpdateDailyGoal,
  user,
  onSignOut,
  onOpenZen,
  onOpenCredits,
  onOpenBadges,
  unreadNotificationsCount,
  onOpenNotifications,
  ambientSound,
  onToggleSound
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isGoalPopoverOpen, setIsGoalPopoverOpen] = useState<boolean>(false);

  // Daily Goal Calculations
  const dailyTargetMinutes = profile.dailyGoalMinutes || 120;
  const dailyTargetHours = +(dailyTargetMinutes / 60).toFixed(1);
  const todayHours = +(todayMinutes / 60).toFixed(1);
  const progressRatio = Math.min(1, todayMinutes / Math.max(1, dailyTargetMinutes));
  const progressPercent = Math.min(100, Math.round((todayMinutes / Math.max(1, dailyTargetMinutes)) * 100));
  const isGoalCompleted = todayMinutes >= dailyTargetMinutes && dailyTargetMinutes > 0;

  // Mini Progress Ring SVG Math (radius = 9, circumference = 2 * PI * 9 ~= 56.548)
  const miniRadius = 9;
  const miniCircumference = 2 * Math.PI * miniRadius;
  const miniStrokeDashoffset = miniCircumference - (progressRatio * miniCircumference);

  // Large Ring in popover (radius = 36, circumference = 2 * PI * 36 ~= 226.19)
  const popoverRadius = 36;
  const popoverCircumference = 2 * Math.PI * popoverRadius;
  const popoverStrokeDashoffset = popoverCircumference - (progressRatio * popoverCircumference);

  const handleSetTargetHours = (hours: number) => {
    const mins = Math.max(15, Math.min(960, Math.round(hours * 60)));
    onUpdateDailyGoal(mins);
    soundEngine.playTick();
  };

  const handleAdjustGoalByMins = (deltaMins: number) => {
    const next = Math.max(30, Math.min(720, dailyTargetMinutes + deltaMins));
    onUpdateDailyGoal(next);
    soundEngine.playTick();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element Brand Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('timer')}
            className="text-left group cursor-pointer"
          >
            <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-emerald-400">
              Stanlake Focus
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean text hover) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'timer'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Timer</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Goals</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'social'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Study Lounge</span>
          </button>

          <button
            onClick={() => setActiveTab('breaks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'breaks'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Break Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>Exams</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* ========================================================= */}
          {/* DAILY FOCUS GOAL: VISUAL PROGRESS RING IN THE HEADER      */}
          {/* ========================================================= */}
          <div className="relative">
            <button
              onClick={() => {
                setIsGoalPopoverOpen(prev => !prev);
                setIsUserMenuOpen(false);
              }}
              title={`Daily Goal: ${todayHours}/${dailyTargetHours} hrs (${progressPercent}%). Click to adjust target.`}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isGoalCompleted
                  ? 'border-emerald-700/80 bg-emerald-950/40 text-emerald-300 shadow-sm shadow-emerald-950/30'
                  : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-300'
              }`}
            >
              {/* Mini SVG Progress Ring */}
              <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 transform -rotate-90">
                  <circle
                    cx="10"
                    cy="10"
                    r={miniRadius}
                    stroke="currentColor"
                    strokeWidth="2.2"
                    fill="transparent"
                    className="text-neutral-800"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r={miniRadius}
                    stroke="currentColor"
                    strokeWidth="2.2"
                    fill="transparent"
                    strokeDasharray={miniCircumference}
                    strokeDashoffset={miniStrokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-700 ease-out ${
                      isGoalCompleted ? 'text-emerald-400' : 'text-emerald-500'
                    }`}
                  />
                </svg>
                {isGoalCompleted && (
                  <Check className="w-2.5 h-2.5 text-emerald-400 absolute" />
                )}
              </div>

              {/* Numerical label */}
              <div className="flex flex-col text-left leading-none font-mono">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400">Goal</span>
                <span className="text-xs font-semibold text-white tabular-nums">
                  {todayHours}/{dailyTargetHours}h
                </span>
              </div>
            </button>

            {/* Interactive Daily Goal Popover */}
            {isGoalPopoverOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-72 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-2xl z-50 animate-fadeIn space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Daily Focus Target</span>
                  </div>
                  <button
                    onClick={() => setIsGoalPopoverOpen(false)}
                    className="text-neutral-500 hover:text-white p-0.5 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Circular Visual Gauge in Popover */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r={popoverRadius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-neutral-800/80"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r={popoverRadius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={popoverCircumference}
                        strokeDashoffset={popoverStrokeDashoffset}
                        strokeLinecap="round"
                        className={`transition-all duration-700 ease-out ${
                          isGoalCompleted ? 'text-emerald-400' : 'text-emerald-500'
                        }`}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-base font-bold font-mono text-white tabular-nums">
                        {progressPercent}%
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {todayMinutes}m / {dailyTargetMinutes}m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Hours Adjustment Stepper */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Target Hours per Day</span>
                    <span className="font-mono text-emerald-400 font-bold">{dailyTargetHours} hours</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <button
                      onClick={() => handleAdjustGoalByMins(-30)}
                      title="Decrease by 30 mins"
                      className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-xs font-mono font-bold text-white tabular-nums">
                      {dailyTargetHours} hrs ({dailyTargetMinutes} mins)
                    </span>

                    <button
                      onClick={() => handleAdjustGoalByMins(30)}
                      title="Increase by 30 mins"
                      className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Presets Buttons */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                    Quick Targets
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map(h => (
                      <button
                        key={h}
                        onClick={() => handleSetTargetHours(h)}
                        className={`py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                          dailyTargetHours === h
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motivational Status Footer */}
                <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-900 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    {isGoalCompleted 
                      ? '🎉 Target reached! Study streak protected.' 
                      : `${Math.max(0, dailyTargetMinutes - todayMinutes)}m more needed today.`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            title="Study Reminders & Notifications"
            className="relative p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Streak indicator */}
          <button
            onClick={onOpenBadges}
            title={`${profile.currentStreak} Day Study Streak`}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono tabular-nums text-amber-300 hover:bg-neutral-900 rounded-md transition-colors cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            <span>{profile.currentStreak}d</span>
          </button>

          {/* XP & Level */}
          <button
            onClick={onOpenBadges}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-900 rounded-md transition-colors cursor-pointer"
            title="View Level & Badges"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="font-mono tabular-nums">Lv.{profile.level}</span>
          </button>

          {/* Ambient Soundscape Toggle */}
          <button
            onClick={onToggleSound}
            title={ambientSound ? `Sound: ${ambientSound} (click to mute)` : 'Enable Ambient Sound'}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              ambientSound 
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' 
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            {ambientSound ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Zen Fullscreen Focus Mode */}
          <button
            onClick={onOpenZen}
            title="Enter Distraction-Free Zen Mode"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zen Mode</span>
          </button>

          {/* Credits Button */}
          <button
            onClick={onOpenCredits}
            title="Created by Stanlake T.Maderera"
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* User Account / Profile Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(prev => !prev);
                  setIsGoalPopoverOpen(false);
                }}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors cursor-pointer"
                title={`Signed in as ${user.name}`}
              >
                <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs">
                  {user.avatar || '🎓'}
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-neutral-800/80 mb-1">
                    <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                    <div className="text-[11px] text-neutral-400 truncate">{user.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsGoalPopoverOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Daily Focus Goal</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenNotifications();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reminder Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-900 py-2 px-2 bg-neutral-950 overflow-x-auto">
        <button
          onClick={() => setActiveTab('timer')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'timer' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Timer
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'goals' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Goals
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'social' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Lounge
        </button>
        <button
          onClick={() => setActiveTab('breaks')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'breaks' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Breaks
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'exams' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Exams
        </button>
      </div>
    </header>
  );
};
