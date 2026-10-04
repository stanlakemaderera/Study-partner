import React from 'react';
import { ActiveTab, UserProfile } from '../types';
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
  Info
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: UserProfile;
  onOpenZen: () => void;
  onOpenCredits: () => void;
  onOpenBadges: () => void;
  ambientSound: string | null;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenZen,
  onOpenCredits,
  onOpenBadges,
  ambientSound,
  onToggleSound
}) => {
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak indicator */}
          <button
            onClick={onOpenBadges}
            title={`${profile.currentStreak} Day Study Streak`}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono tabular-nums text-amber-300 hover:bg-neutral-900 rounded-md transition-colors"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            <span>{profile.currentStreak}d</span>
          </button>

          {/* XP & Level */}
          <button
            onClick={onOpenBadges}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-900 rounded-md transition-colors"
            title="View Level & Badges"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="font-mono tabular-nums">Lv.{profile.level}</span>
          </button>

          {/* Ambient Soundscape Toggle */}
          <button
            onClick={onToggleSound}
            title={ambientSound ? `Sound: ${ambientSound} (click to mute)` : 'Enable Ambient Sound'}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zen Mode</span>
          </button>

          {/* Credits Button */}
          <button
            onClick={onOpenCredits}
            title="Created by Stanlake T.Maderera"
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
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
