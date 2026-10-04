import React, { useState, useEffect } from 'react';
import { FocusSession, TimerMode } from '../types';
import { soundEngine } from '../utils/audio';
import { 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles 
} from 'lucide-react';
import { getRandomQuote } from '../utils/quotes';

interface ZenOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  timerMode: TimerMode;
  subject: string;
  topic: string;
  ambientSound: string | null;
  setAmbientSound: (sound: string | null) => void;
  onSessionComplete: (session: FocusSession) => void;
}

export const ZenOverlay: React.FC<ZenOverlayProps> = ({
  isOpen,
  onClose,
  timerMode,
  subject,
  topic,
  ambientSound,
  setAmbientSound,
  onSessionComplete
}) => {
  const [seconds, setSeconds] = useState<number>(timerMode === 'deep_work' ? 50 * 60 : 25 * 60);
  const [initialDuration, setInitialDuration] = useState<number>(timerMode === 'deep_work' ? 50 * 60 : 25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [quote] = useState(getRandomQuote());
  const [startTime] = useState<string>(new Date().toISOString());

  // Listen to keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning(prev => !prev);
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Tick
  useEffect(() => {
    if (!isOpen || !isRunning) return;

    const interval = window.setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning]);

  const handleFinish = () => {
    soundEngine.playChime('bowl');
    const elapsedMinutes = Math.max(1, Math.round((initialDuration - seconds) / 60));
    const session: FocusSession = {
      id: 'zen-' + Date.now(),
      startTime,
      endTime: new Date().toISOString(),
      durationMinutes: elapsedMinutes,
      subject: subject || 'Deep Work',
      topic: topic || 'Zen Focus Session',
      mode: timerMode,
      completed: true,
      rating: 5
    };
    onSessionComplete(session);
    onClose();
  };

  if (!isOpen) return null;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progressPercent = Math.max(0, Math.min(100, ((initialDuration - seconds) / initialDuration) * 100));

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-neutral-950 text-white p-6 sm:p-12 select-none animate-fadeIn">
      {/* Top Bar: Minimal exit & audio */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
            Zen Focus Room
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-xs text-neutral-400">
            {subject} {topic && `— ${topic}`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Ambient sound toggle */}
          <button
            onClick={() => {
              if (ambientSound) {
                soundEngine.stopAmbient();
                setAmbientSound(null);
              } else {
                soundEngine.playAmbient('rain');
                setAmbientSound('rain');
              }
            }}
            title="Toggle Rain Audio"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            {ambientSound ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="capitalize">{ambientSound || 'Silent'}</span>
          </button>

          {/* Exit Zen */}
          <button
            onClick={onClose}
            title="Exit Zen Mode (Esc)"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit (Esc)</span>
          </button>
        </div>
      </div>

      {/* Center: Distraction-free massive timer */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6 text-center">
        {/* Subtle breathing glow ring */}
        <div className="relative">
          <div className="text-7xl sm:text-9xl font-mono tabular-nums font-extralight tracking-tighter text-neutral-100">
            {timeFormatted}
          </div>
        </div>

        {/* Minimal Thin Progress Line */}
        <div className="w-64 sm:w-96 h-1 bg-neutral-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500/80 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Subtle Quote */}
        <p className="max-w-md text-xs sm:text-sm text-neutral-400 italic font-light px-4">
          "{quote.text}"
        </p>

        {/* Minimal Controls */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => {
              setIsRunning(false);
              setSeconds(initialDuration);
            }}
            title="Reset"
            className="p-3 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-2.5 rounded-full bg-neutral-100 text-neutral-950 font-medium text-sm hover:bg-white transition-colors"
          >
            {isRunning ? 'Pause (Space)' : 'Resume (Space)'}
          </button>
        </div>
      </div>

      {/* Bottom Bar: Mandatory Credits & Short info */}
      <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-900 pt-4">
        <div>
          <span>Press </span>
          <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded font-mono text-neutral-400">Space</kbd>
          <span> to toggle pause</span>
        </div>
        <div className="font-medium text-neutral-400">
          Created by Stanlake T.Maderera
        </div>
      </div>
    </div>
  );
};
