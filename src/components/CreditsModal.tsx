import React from 'react';
import { X, Award, CheckCircle, Heart, Sparkles, BookOpen, Shield, Users } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">
              App Credits & Attribution
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Created by Stanlake T.Maderera
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
          <p>
            <strong>Stanlake Focus</strong> is an uncompromising deep work and academic mastery system built to eliminate distraction, optimize cognitive stamina, and provide real-time peer solidarity.
          </p>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 space-y-2.5">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Core Architectural Pillars
            </span>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-200">Customizable Focus Engine:</strong> 25-Minute Focus Sprints, 50/10 Deep Work, custom duration, and stopwatch timer with procedural Web Audio soundscapes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-200">Learning Analytics:</strong> Weekly focus trend charts, subject mastery breakdown, and circadian rhythm time-of-day analytics.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-emerald-400">Burnout Shield:</strong> Guided 4-7-8 breathing cycles, 5-step desk ergonomics, 20-20-20 eye rests, and brain teasers.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-200">Real-Time Study Lounge:</strong> Live peer presence with cross-tab/network sync, shared reactions, and custom room codes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-200">Final Exam Countdowns:</strong> High-precision second-by-second countdowns with syllabus milestones checklist.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between text-neutral-500 pt-2 border-t border-neutral-900">
            <span>Production Version 1.0.0</span>
            <span className="text-neutral-400 font-medium">Created by Stanlake T.Maderera</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition-colors cursor-pointer"
        >
          Return to Focus
        </button>
      </div>
    </div>
  );
};
