import React from 'react';
import { UserProfile } from '../types';
import { ALL_BADGES, calculateLevel } from '../utils/gamification';
import { 
  X, 
  Award, 
  Flame, 
  Sparkles, 
  Check, 
  Lock, 
  Compass, 
  Zap, 
  Moon, 
  Sun, 
  Heart, 
  Users, 
  Calendar 
} from 'lucide-react';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-amber-400" />,
  Compass: <Compass className="w-5 h-5 text-indigo-400" />,
  Award: <Award className="w-5 h-5 text-emerald-400" />,
  Flame: <Flame className="w-5 h-5 text-orange-400" />,
  Zap: <Zap className="w-5 h-5 text-yellow-400" />,
  Moon: <Moon className="w-5 h-5 text-purple-400" />,
  Sun: <Sun className="w-5 h-5 text-amber-300" />,
  Heart: <Heart className="w-5 h-5 text-rose-400" />,
  Users: <Users className="w-5 h-5 text-sky-400" />,
  Calendar: <Calendar className="w-5 h-5 text-teal-400" />
};

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  if (!isOpen) return null;

  const levelInfo = calculateLevel(profile.xp);
  const unlockedSet = new Set(profile.unlockedBadgeIds || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Academic Mastery & Streaks</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level & XP Banner */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  Level {levelInfo.level}
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-sm font-bold text-white">{levelInfo.title}</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Earn 10 XP per minute studied, +50 XP on completion, +40 XP on break wellness routines.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-neutral-400">Total XP: </span>
                <span className="text-emerald-400 font-bold tabular-nums">{profile.xp}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                <span>{profile.currentStreak} Day Streak</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>Next Level Progress</span>
              <span>{levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)</span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges Collection Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold uppercase tracking-wider">Achievements Collection</span>
            <span>{unlockedSet.size} of {ALL_BADGES.length} Unlocked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_BADGES.map(badge => {
              const isUnlocked = unlockedSet.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isUnlocked
                      ? 'border-neutral-800 bg-neutral-900/60 shadow-sm'
                      : 'border-neutral-900 bg-neutral-950/40 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 shrink-0">
                      {isUnlocked ? (
                        BADGE_ICONS[badge.iconName] || <Award className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-neutral-600" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">{badge.title}</h4>
                        {isUnlocked && (
                          <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>Unlocked</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {badge.description}
                      </p>
                      <div className="text-[11px] text-neutral-500 font-mono pt-1">
                        Requirement: {badge.requirement}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-neutral-900 text-center text-xs text-neutral-500 font-medium">
          Created by Stanlake T.Maderera
        </div>
      </div>
    </div>
  );
};
