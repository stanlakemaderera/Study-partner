import React, { useState } from 'react';
import { Goal, UserProfile } from '../types';
import { soundEngine } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/gamification';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  TrendingUp, 
  Flame, 
  Award, 
  BookOpen 
} from 'lucide-react';

interface GoalTrackerProps {
  goals: Goal[];
  onUpdateGoals: (goals: Goal[]) => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  todayMinutes: number;
  subjects?: string[];
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  goals,
  onUpdateGoals,
  profile,
  onUpdateProfile,
  todayMinutes,
  subjects = ['Mathematics', 'Computer Science', 'Biology', 'Physics', 'Chemistry', 'Literature']
}) => {
  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<'daily_hours' | 'weekly_subject' | 'exam_milestone'>('weekly_subject');
  const [targetMinutes, setTargetMinutes] = useState<number>(120);
  const [subject, setSubject] = useState<string>('Mathematics');

  // Daily goal progress
  const dailyTargetMinutes = profile.dailyGoalMinutes || 120;
  const dailyProgressPercent = Math.min(100, Math.round((todayMinutes / dailyTargetMinutes) * 100));

  const handleUpdateDailyGoal = (mins: number) => {
    onUpdateProfile({ ...profile, dailyGoalMinutes: mins });
    soundEngine.playTick();
  };

  const handleToggleGoal = (goalId: string) => {
    soundEngine.playTick();
    const updated = goals.map(g => {
      if (g.id !== goalId) return g;
      const nextCompleted = !g.completed;
      if (nextCompleted) {
        fireCelebrationConfetti();
        soundEngine.playChime('bowl');
      }
      return { ...g, completed: nextCompleted };
    });
    onUpdateGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    onUpdateGoals(goals.filter(g => g.id !== goalId));
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newGoal: Goal = {
      id: 'goal-' + Date.now(),
      title: title.trim(),
      type,
      targetMinutes,
      currentMinutes: 0,
      subject: type === 'weekly_subject' ? subject : undefined,
      completed: false
    };

    onUpdateGoals([...goals, newGoal]);
    setIsAddingGoal(false);
    setTitle('');
    soundEngine.playChime('bell');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Focus Goals & Milestones</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Turn lofty academic ambitions into measurable, daily micro-targets and weekly subject quotas.
          </p>
        </div>

        <button
          onClick={() => setIsAddingGoal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Daily Target Spotlight Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Daily Focus Target</h3>
              <p className="text-xs text-neutral-400">
                Today's progress: <strong className="text-white font-mono">{todayMinutes}m</strong> of{' '}
                <strong className="text-emerald-400 font-mono">{dailyTargetMinutes}m</strong>
              </p>
            </div>
          </div>

          {/* Quick Target Presets */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-[11px] text-neutral-500 px-2">Target:</span>
            {[60, 90, 120, 180, 240].map(mins => (
              <button
                key={mins}
                onClick={() => handleUpdateDailyGoal(mins)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  dailyTargetMinutes === mins
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {mins / 60}h
              </button>
            ))}
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Progress: {dailyProgressPercent}%</span>
            <span>
              {todayMinutes >= dailyTargetMinutes ? '🎉 Target Achieved!' : `${dailyTargetMinutes - todayMinutes}m remaining today`}
            </span>
          </div>
          <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                todayMinutes >= dailyTargetMinutes ? 'bg-emerald-400' : 'bg-emerald-600'
              }`}
              style={{ width: `${dailyProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Goal Form */}
      {isAddingGoal && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Add New Academic Goal</h3>
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-neutral-400">Goal Description</label>
              <input
                type="text"
                placeholder="e.g. Master Linear Algebra Eigenvectors, Solve 50 Biology MCQs"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Goal Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'daily_hours' | 'weekly_subject' | 'exam_milestone')}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="weekly_subject">Weekly Subject Target</option>
                <option value="exam_milestone">Exam Preparation Milestone</option>
                <option value="daily_hours">Daily Target Routine</option>
              </select>
            </div>

            {type === 'weekly_subject' && (
              <div className="space-y-1">
                <label className="text-xs text-neutral-400">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Target Minutes</label>
              <input
                type="number"
                min={15}
                max={1200}
                step={15}
                value={targetMinutes}
                onChange={e => setTargetMinutes(parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className="px-4 py-2 border border-neutral-800 rounded-lg text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Active Goals & Milestones</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <div
              key={goal.id}
              className={`p-4 rounded-xl border transition-all ${
                goal.completed
                  ? 'border-neutral-800/80 bg-neutral-950/40 opacity-70'
                  : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => handleToggleGoal(goal.id)}
                  className="flex items-start gap-3 text-left cursor-pointer flex-1"
                >
                  <div className="mt-0.5 shrink-0">
                    {goal.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-500 hover:text-neutral-300" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${goal.completed ? 'line-through text-neutral-400' : 'text-white'}`}>
                      {goal.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                      {goal.subject && <span>{goal.subject}</span>}
                      {goal.subject && <span>·</span>}
                      <span className="font-mono">
                        Target: {(goal.targetMinutes / 60).toFixed(1)}h ({goal.targetMinutes}m)
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  title="Remove Goal"
                  className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 pt-3 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>Status</span>
                <span className={goal.completed ? 'text-emerald-400' : 'text-neutral-300'}>
                  {goal.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
