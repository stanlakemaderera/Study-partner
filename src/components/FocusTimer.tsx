import React, { useState, useEffect, useRef } from 'react';
import { TimerMode, FocusSession, UserProfile } from '../types';
import { soundEngine } from '../utils/audio';
import { getRandomQuote, getRandomNudge, Quote } from '../utils/quotes';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  Headphones, 
  Sparkles, 
  Maximize2, 
  Coffee,
  Bookmark,
  BookOpen,
  Trash2,
  X,
  Check
} from 'lucide-react';

interface FocusTimerProps {
  onSessionComplete: (session: FocusSession) => void;
  onOpenZen: () => void;
  onOpenBreakHub: () => void;
  profile: UserProfile;
  ambientSound: string | null;
  setAmbientSound: (sound: string | null) => void;
  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;
  subject: string;
  setSubject: (sub: string) => void;
  topic: string;
  setTopic: (top: string) => void;
  subjects: string[];
  onAddSubject: (newSub: string) => void;
  onDeleteSubject: (subToDelete: string) => void;
}

const PRESET_DURATIONS: Record<TimerMode, number> = {
  focus_sprint: 25 * 60,
  pomodoro: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
  deep_work: 50 * 60,
  custom: 45 * 60,
  stopwatch: 0
};

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSessionComplete,
  onOpenZen,
  onOpenBreakHub,
  profile,
  ambientSound,
  setAmbientSound,
  timerMode,
  setTimerMode,
  subject,
  setSubject,
  topic,
  setTopic,
  subjects,
  onAddSubject,
  onDeleteSubject
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(PRESET_DURATIONS[timerMode] || 25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [initialSeconds, setInitialSeconds] = useState<number>(PRESET_DURATIONS[timerMode] || 25 * 60);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [activeQuote, setActiveQuote] = useState<Quote>(getRandomQuote());
  const [activeNudge, setActiveNudge] = useState<string>(getRandomNudge());
  const [customMinutesInput, setCustomMinutesInput] = useState<number>(45);
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Custom Subject Management state
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [isManagingSubjects, setIsManagingSubjects] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Sync preset changes
  const switchMode = (mode: TimerMode) => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'custom') {
      const secs = customMinutesInput * 60;
      setSecondsRemaining(secs);
      setInitialSeconds(secs);
    } else {
      const secs = PRESET_DURATIONS[mode] || 25 * 60;
      setSecondsRemaining(secs);
      setInitialSeconds(secs);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      if (!sessionStartTime) {
        setSessionStartTime(new Date().toISOString());
      }

      timerRef.current = window.setInterval(() => {
        setSecondsRemaining(prev => {
          if (timerMode === 'stopwatch') {
            return prev + 1;
          }

          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timerMode]);

  // Handle completion
  const handleTimerComplete = () => {
    setIsRunning(false);
    soundEngine.playChime('bowl');

    const durationMins = Math.max(1, Math.round((initialSeconds - secondsRemaining) / 60));
    const nowIso = new Date().toISOString();

    const newSession: FocusSession = {
      id: 'session-' + Date.now(),
      startTime: sessionStartTime || new Date(Date.now() - durationMins * 60000).toISOString(),
      endTime: nowIso,
      durationMinutes: durationMins,
      subject: subject || 'General Study',
      topic: topic.trim() || undefined,
      notes: sessionNotes.trim() || undefined,
      mode: timerMode,
      completed: true,
      rating: 5
    };

    onSessionComplete(newSession);
    setSessionStartTime(null);
  };

  // Manual complete / log session
  const handleManualComplete = () => {
    if (timerMode === 'stopwatch') {
      if (secondsRemaining < 60) {
        alert('Focus session must be at least 1 minute to record.');
        return;
      }
      setIsRunning(false);
      soundEngine.playChime('bell');
      const durationMins = Math.round(secondsRemaining / 60);
      const newSession: FocusSession = {
        id: 'session-' + Date.now(),
        startTime: sessionStartTime || new Date(Date.now() - secondsRemaining * 1000).toISOString(),
        endTime: new Date().toISOString(),
        durationMinutes: durationMins,
        subject: subject || 'General Study',
        topic: topic.trim() || undefined,
        notes: sessionNotes.trim() || undefined,
        mode: 'stopwatch',
        completed: true,
        rating: 5
      };
      onSessionComplete(newSession);
      setSecondsRemaining(0);
      setSessionStartTime(null);
      return;
    }

    const elapsedSeconds = initialSeconds - secondsRemaining;
    if (elapsedSeconds < 60) {
      alert('Focus session must be at least 1 minute to record.');
      return;
    }

    setIsRunning(false);
    soundEngine.playChime('bell');
    const durationMins = Math.round(elapsedSeconds / 60);
    const newSession: FocusSession = {
      id: 'session-' + Date.now(),
      startTime: sessionStartTime || new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: durationMins,
      subject: subject || 'General Study',
      topic: topic.trim() || undefined,
      notes: sessionNotes.trim() || undefined,
      mode: timerMode,
      completed: true,
      rating: 5
    };
    onSessionComplete(newSession);
    setSecondsRemaining(initialSeconds);
    setSessionStartTime(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(initialSeconds);
    setSessionStartTime(null);
  };

  const handleAddFiveMinutes = () => {
    setSecondsRemaining(prev => prev + 300);
    setInitialSeconds(prev => prev + 300);
  };

  const handleApplyCustomMinutes = () => {
    const mins = Math.max(1, Math.min(240, customMinutesInput));
    setCustomMinutesInput(mins);
    setSecondsRemaining(mins * 60);
    setInitialSeconds(mins * 60);
    setIsEditingCustom(false);
  };

  const handleCreateSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSubjectName.trim();
    if (!clean) return;
    onAddSubject(clean);
    setSubject(clean);
    setNewSubjectName('');
    setIsAddingSubject(false);
  };

  // Format time MM:SS or HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressRatio = timerMode === 'stopwatch' 
    ? 1 
    : initialSeconds > 0 
      ? Math.max(0, Math.min(1, (initialSeconds - secondsRemaining) / initialSeconds)) 
      : 0;

  // Circular stroke dash offset
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Motivational wisdom banner */}
      <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-200 italic leading-relaxed">
              "{activeQuote.text}"
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold text-emerald-400">{activeQuote.author}</span>
              <span>·</span>
              <span className="capitalize">{activeQuote.category}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveQuote(getRandomQuote());
              setActiveNudge(getRandomNudge());
            }}
            title="Next inspirational quote"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Next Quote</span>
          </button>
        </div>
      </div>

      {/* Main Focus Control Container */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-10 backdrop-blur-sm relative overflow-hidden">
        {/* Top Segmented Timer Modes (Intuitive Focus Sprint replaces Pomodoro) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-neutral-950/80 rounded-xl max-w-xl mx-auto border border-neutral-800/80">
          <button
            onClick={() => switchMode('focus_sprint')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              timerMode === 'focus_sprint' || timerMode === 'pomodoro'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            25m Focus Sprint
          </button>
          <button
            onClick={() => switchMode('deep_work')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              timerMode === 'deep_work'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            50m Deep Work
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              timerMode === 'short_break'
                ? 'bg-emerald-900/60 text-emerald-200 shadow-sm border border-emerald-700/50'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            5m Short Break
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              timerMode === 'long_break'
                ? 'bg-emerald-900/60 text-emerald-200 shadow-sm border border-emerald-700/50'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            15m Rest
          </button>
          <button
            onClick={() => {
              switchMode('custom');
              setIsEditingCustom(true);
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              timerMode === 'custom'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Custom
          </button>
          <button
            onClick={() => switchMode('stopwatch')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              timerMode === 'stopwatch'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Stopwatch
          </button>
        </div>

        {/* Custom duration input modal popover */}
        {isEditingCustom && timerMode === 'custom' && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-neutral-400">Duration (minutes):</span>
            <input
              type="number"
              min={1}
              max={240}
              value={customMinutesInput}
              onChange={e => setCustomMinutesInput(parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-center text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleApplyCustomMinutes}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors cursor-pointer"
            >
              Set
            </button>
          </div>
        )}

        {/* Subject & Topic Selector Bar with User-Added Custom Subjects */}
        <div className="mt-8 space-y-3 max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
            {/* Subject Dropdown & Actions */}
            <div className="w-full sm:w-1/2 flex items-center gap-1.5">
              <div className="relative flex-1">
                <select
                  value={subject}
                  onChange={e => {
                    if (e.target.value === '__add_new__') {
                      setIsAddingSubject(true);
                    } else {
                      setSubject(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="__add_new__">+ Add New Subject...</option>
                </select>
              </div>

              {/* Add Subject Button */}
              <button
                type="button"
                onClick={() => setIsAddingSubject(prev => !prev)}
                title="Add your custom subject"
                className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Manage Subjects Button */}
              <button
                type="button"
                onClick={() => setIsManagingSubjects(prev => !prev)}
                title="Manage all subjects"
                className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </div>

            {/* Topic input */}
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                placeholder="Topic or goal (e.g. Chapter 4 Practice)"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Inline Add Subject Form */}
          {isAddingSubject && (
            <form onSubmit={handleCreateSubjectSubmit} className="flex items-center gap-2 p-3 bg-neutral-950/90 border border-emerald-800/80 rounded-xl animate-fadeIn">
              <input
                type="text"
                placeholder="New subject (e.g. Biochemistry, Japanese, Law)..."
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                autoFocus
                className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubject(false)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Manage Subjects Popover / List */}
          {isManagingSubjects && (
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-1 border-b border-neutral-800">
                <span className="font-semibold text-white">Your Subjects ({subjects.length})</span>
                <button
                  type="button"
                  onClick={() => setIsManagingSubjects(false)}
                  className="hover:text-white text-neutral-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {subjects.map(sub => (
                  <div
                    key={sub}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                      subject === sub
                        ? 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-300'
                    }`}
                  >
                    <span 
                      onClick={() => {
                        setSubject(sub);
                        setIsManagingSubjects(false);
                      }}
                      className="cursor-pointer hover:underline"
                    >
                      {sub}
                    </span>
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteSubject(sub)}
                        title={`Delete ${sub}`}
                        className="text-neutral-500 hover:text-rose-400 transition-colors ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Circular Display */}
        <div className="my-10 flex flex-col items-center justify-center relative">
          <div className="relative flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-72 h-72 sm:w-80 sm:h-80 transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-neutral-800/60"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className={`transition-all duration-500 ${
                  timerMode.includes('break') ? 'stroke-emerald-500' : 'stroke-indigo-500'
                }`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-4xl sm:text-5xl font-mono tabular-nums font-bold tracking-tight text-white drop-shadow-sm">
                {formatTime(secondsRemaining)}
              </span>
              <span className="mt-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
                {timerMode === 'stopwatch' ? 'Counting Up' : isRunning ? 'In Session' : 'Ready'}
              </span>
              <div className="mt-1 text-xs text-neutral-400 max-w-[180px] truncate">
                {topic || subject}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={handleReset}
            title="Reset Timer"
            className="p-3 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all transform active:scale-95 cursor-pointer shadow-lg ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          {timerMode !== 'stopwatch' && (
            <button
              onClick={handleAddFiveMinutes}
              title="Add 5 Minutes"
              className="p-3 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>5m</span>
            </button>
          )}

          {/* Complete / Check off button */}
          {(isRunning || secondsRemaining !== initialSeconds) && (
            <button
              onClick={handleManualComplete}
              title="Log and Complete Session Now"
              className="p-3 rounded-xl border border-emerald-800/80 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Secondary Bar: Ambient Soundscapes & Zen Fullscreen */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-400">Ambient Sound:</span>
            <div className="flex items-center gap-1 p-0.5 bg-neutral-950 border border-neutral-800 rounded-lg">
              {(['none', 'rain', 'whitenoise', 'binaural', 'stream'] as const).map(sound => (
                <button
                  key={sound}
                  onClick={() => {
                    if (ambientSound === sound || sound === 'none') {
                      soundEngine.stopAmbient();
                      setAmbientSound(null);
                    } else {
                      soundEngine.playAmbient(sound);
                      setAmbientSound(sound);
                    }
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                    (ambientSound === sound || (!ambientSound && sound === 'none'))
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {sound === 'none' ? 'Mute' : sound === 'whitenoise' ? 'Pink Noise' : sound === 'binaural' ? '40Hz Focus' : sound}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBreakHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>Break Activities</span>
            </button>

            <button
              onClick={onOpenZen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Distraction-Free Zen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Focus Nudge & Session Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Periodic Focus Nudge */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-medium text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Focus Nudge</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {activeNudge}
          </p>
        </div>

        {/* Quick Session Notepad */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-medium text-neutral-400">
            <Bookmark className="w-4 h-4" />
            <span>Session Scratchpad</span>
          </div>
          <input
            type="text"
            placeholder="Key takeaway or question to research later..."
            value={sessionNotes}
            onChange={e => setSessionNotes(e.target.value)}
            className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
          />
        </div>
      </div>
    </div>
  );
};
