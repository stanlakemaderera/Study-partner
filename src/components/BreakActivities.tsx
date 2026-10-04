import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { soundEngine } from '../utils/audio';
import { 
  Wind, 
  Activity, 
  BrainCircuit, 
  Droplets, 
  Check, 
  RotateCw, 
  Play, 
  Pause,
  Award
} from 'lucide-react';

interface BreakActivitiesProps {
  profile: UserProfile;
  onActivityComplete: (type: string, xpEarned: number) => void;
  onClose?: () => void;
}

const BRAIN_TEASERS = [
  {
    question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    hint: "Don't fall for the intuitive 10 cents answer! Write the algebra equation.",
    answer: "5 cents ($0.05). If the ball is $0.05, the bat is $1.05, and together they equal $1.10."
  },
  {
    question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    hint: "Think about the production rate of a single machine.",
    answer: "5 minutes! Each machine takes 5 minutes to make 1 widget. So 100 machines simultaneously produce 100 widgets in the same 5 minutes."
  },
  {
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    hint: "Think of mountain valleys and canyons.",
    answer: "An echo."
  },
  {
    question: "What 5-letter word becomes shorter when you add two letters to it?",
    hint: "Read the clue literally!",
    answer: "The word 'Short' (add 'er' to get 'Shorter')."
  }
];

const STRETCHES = [
  {
    name: 'Neck & Upper Trapezius Release',
    instruction: 'Gently tilt your right ear toward your right shoulder. Hold for 15 seconds, then switch sides. Breathe deeply.',
    duration: 30,
    target: 'Cervical spine & neck stiffness from screen tilt'
  },
  {
    name: 'Shoulder Blade Pinches & Chest Opener',
    instruction: 'Interlace fingers behind your lower back, roll shoulders back and down, gently lift hands until you feel chest expand.',
    duration: 30,
    target: 'Counters rounded posture from keyboard typing'
  },
  {
    name: 'Seated Spinal Twist',
    instruction: 'Sit tall, place right hand on the back of your chair and left hand on your right knee. Gently twist your torso. Switch sides.',
    duration: 30,
    target: 'Decompresses thoracic discs and stimulates circulation'
  },
  {
    name: 'Wrist & Forearm Extensor Stretch',
    instruction: 'Extend your arm forward with palm facing up. Use the other hand to gently pull your fingers downward toward your body.',
    duration: 25,
    target: 'Prevents repetitive strain injury (RSI) & carpal pressure'
  },
  {
    name: '20-20-20 Eye Strain Reset',
    instruction: 'Shift your gaze away from all screens. Focus on an object at least 20 feet away (out of a window is best) for 20 continuous seconds.',
    duration: 20,
    target: 'Relaxes ciliary muscles in the eyes to prevent digital fatigue'
  }
];

export const BreakActivities: React.FC<BreakActivitiesProps> = ({
  profile,
  onActivityComplete
}) => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'stretches' | 'puzzles' | 'hydration'>('breathing');

  // Breathing state (4-7-8 method)
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseSeconds, setPhaseSeconds] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  // Stretches state
  const [currentStretchIdx, setCurrentStretchIdx] = useState<number>(0);
  const [stretchSecondsLeft, setStretchSecondsLeft] = useState<number>(STRETCHES[0].duration);
  const [isStretchRunning, setIsStretchRunning] = useState<boolean>(false);
  const [stretchesDone, setStretchesDone] = useState<boolean[]>(new Array(STRETCHES.length).fill(false));

  // Puzzle state
  const [puzzleIdx, setPuzzleIdx] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // Hydration local count
  const [glasses, setGlasses] = useState<number>(profile.glassesOfWater || 0);

  // Breathing interval engine
  useEffect(() => {
    if (!isBreathingActive) return;

    const interval = window.setInterval(() => {
      setPhaseSeconds(prev => {
        if (prev <= 1) {
          if (breathingPhase === 'inhale') {
            setBreathingPhase('hold');
            return 7;
          } else if (breathingPhase === 'hold') {
            setBreathingPhase('exhale');
            return 8;
          } else {
            // Completed 1 full cycle
            setCyclesCompleted(c => {
              const newC = c + 1;
              if (newC === 3) {
                soundEngine.playChime('bowl');
                onActivityComplete('4-7-8 Breathing Cycle (3 rounds)', 40);
              }
              return newC;
            });
            setBreathingPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase, onActivityComplete]);

  // Stretch interval engine
  useEffect(() => {
    if (!isStretchRunning) return;

    const interval = window.setInterval(() => {
      setStretchSecondsLeft(prev => {
        if (prev <= 1) {
          soundEngine.playChime('bell');
          // mark current stretch completed
          setStretchesDone(arr => {
            const nextArr = [...arr];
            nextArr[currentStretchIdx] = true;
            return nextArr;
          });

          if (currentStretchIdx < STRETCHES.length - 1) {
            const nextIdx = currentStretchIdx + 1;
            setCurrentStretchIdx(nextIdx);
            return STRETCHES[nextIdx].duration;
          } else {
            setIsStretchRunning(false);
            onActivityComplete('Desk Ergonomics & Full Stretch Routine', 50);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStretchRunning, currentStretchIdx, onActivityComplete]);

  const handleLogWater = () => {
    const updated = glasses + 1;
    setGlasses(updated);
    soundEngine.playChime('bell');
    onActivityComplete('Logged Hydration Glass', 15);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Break & Burnout Shield</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Recharge cognitive neurotransmitters, reset posture, and return to focus at 100% capacity.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>Break routines completed: <strong className="text-emerald-400 font-mono">{profile.breakActivitiesDone}</strong></span>
          <span>·</span>
          <span>Hydration: <strong className="text-blue-400 font-mono">{glasses}/8 cups</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800/80 pb-2">
        <button
          onClick={() => setActiveTab('breathing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'breathing'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Wind className="w-4 h-4 text-emerald-400" />
          <span>4-7-8 Deep Breathing</span>
        </button>

        <button
          onClick={() => setActiveTab('stretches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'stretches'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Desk Stretches & 20-20-20</span>
        </button>

        <button
          onClick={() => setActiveTab('puzzles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'puzzles'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span>Micro Brain Teasers</span>
        </button>

        <button
          onClick={() => setActiveTab('hydration')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'hydration'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Droplets className="w-4 h-4 text-sky-400" />
          <span>Hydration & Posture Log</span>
        </button>
      </div>

      {/* Tab 1: 4-7-8 Breathing Guide */}
      {activeTab === 'breathing' && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-white">4-7-8 Relaxing Breath Technique</h3>
            <p className="text-xs text-neutral-400">
              Inhale through nose for 4s · Hold breath gently for 7s · Exhale slowly through mouth for 8s.
            </p>
          </div>

          {/* Interactive Breathing Visual Sphere */}
          <div className="h-64 flex items-center justify-center">
            <div 
              className={`rounded-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out border border-emerald-500/30 shadow-2xl ${
                !isBreathingActive 
                  ? 'w-40 h-40 bg-neutral-800/80' 
                  : breathingPhase === 'inhale'
                    ? 'w-60 h-60 bg-emerald-950/60 shadow-emerald-500/20 scale-105'
                    : breathingPhase === 'hold'
                      ? 'w-60 h-60 bg-indigo-950/60 shadow-indigo-500/20 scale-100'
                      : 'w-36 h-36 bg-neutral-900/90 shadow-neutral-500/10 scale-95'
              }`}
            >
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400">
                {isBreathingActive ? breathingPhase : 'Ready'}
              </span>
              <span className="text-4xl font-mono tabular-nums font-bold text-white mt-1">
                {isBreathingActive ? phaseSeconds : '4-7-8'}
              </span>
              {isBreathingActive && (
                <span className="text-[11px] text-neutral-400 mt-1">
                  Cycle #{cyclesCompleted + 1}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (isBreathingActive) {
                  setIsBreathingActive(false);
                } else {
                  setIsBreathingActive(true);
                  setBreathingPhase('inhale');
                  setPhaseSeconds(4);
                }
              }}
              className={`px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                isBreathingActive
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
              }`}
            >
              {isBreathingActive ? 'Pause Breathing' : 'Start 4-7-8 Guided Session'}
            </button>
            <button
              onClick={() => {
                setIsBreathingActive(false);
                setCyclesCompleted(0);
                setPhaseSeconds(4);
                setBreathingPhase('inhale');
              }}
              className="p-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Complete 3 cycles to earn +40 XP and refresh nervous system balance.</span>
          </div>
        </div>
      )}

      {/* Tab 2: Desk Stretches & 20-20-20 */}
      {activeTab === 'stretches' && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">5-Step Ergonomic Decompression</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Designed to counteract study fatigue, neck hunching, and digital eye strain.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tabular-nums text-emerald-400">
                Step {currentStretchIdx + 1} of {STRETCHES.length}
              </span>
            </div>
          </div>

          {/* Current Step Spotlight */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Exercise #{currentStretchIdx + 1}
              </span>
              <span className="text-2xl font-mono tabular-nums font-bold text-white">
                {stretchSecondsLeft}s
              </span>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">{STRETCHES[currentStretchIdx].name}</h4>
              <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                {STRETCHES[currentStretchIdx].instruction}
              </p>
              <div className="mt-3 text-xs text-neutral-400">
                <strong>Target benefit:</strong> {STRETCHES[currentStretchIdx].target}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsStretchRunning(!isStretchRunning)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isStretchRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isStretchRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isStretchRunning ? 'Pause Timer' : 'Start Stretch Timer'}</span>
              </button>

              <button
                onClick={() => {
                  if (currentStretchIdx < STRETCHES.length - 1) {
                    const next = currentStretchIdx + 1;
                    setCurrentStretchIdx(next);
                    setStretchSecondsLeft(STRETCHES[next].duration);
                  }
                }}
                className="px-4 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-xs font-medium text-neutral-300 transition-colors"
              >
                Skip to Next
              </button>
            </div>
          </div>

          {/* Steps List checklist */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-semibold text-neutral-400">Routine Checklist:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STRETCHES.map((s, idx) => (
                <button
                  key={s.name}
                  onClick={() => {
                    setCurrentStretchIdx(idx);
                    setStretchSecondsLeft(s.duration);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    currentStretchIdx === idx
                      ? 'border-emerald-700 bg-emerald-950/30 text-white'
                      : stretchesDone[idx]
                        ? 'border-neutral-800 bg-neutral-900/60 text-neutral-400'
                        : 'border-neutral-800/80 bg-neutral-950/40 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-medium truncate">{idx + 1}. {s.name}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">{s.duration}s</div>
                  </div>
                  {stretchesDone[idx] ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-neutral-700 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Micro Brain Teasers */}
      {activeTab === 'puzzles' && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Cognitive Refresh & Lateral Thinking</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Quick, low-stress riddles that kickstart neuroplasticity between study blocks.
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-400">
              Puzzle {puzzleIdx + 1} of {BRAIN_TEASERS.length}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
            <p className="text-sm sm:text-base font-medium text-neutral-100 leading-relaxed">
              "{BRAIN_TEASERS[puzzleIdx].question}"
            </p>

            <div className="text-xs text-neutral-400 italic">
              <strong>Hint:</strong> {BRAIN_TEASERS[puzzleIdx].hint}
            </div>

            {showAnswer ? (
              <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-4 animate-fadeIn">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Solution:
                </span>
                <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                  {BRAIN_TEASERS[puzzleIdx].answer}
                </p>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowAnswer(true);
                  onActivityComplete('Brain Teaser Solved', 25);
                }}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors cursor-pointer"
              >
                Reveal Solution
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setShowAnswer(false);
                setPuzzleIdx(prev => (prev > 0 ? prev - 1 : BRAIN_TEASERS.length - 1));
              }}
              className="px-3 py-1.5 rounded-lg border border-neutral-800 text-xs text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              Previous Riddle
            </button>
            <button
              onClick={() => {
                setShowAnswer(false);
                setPuzzleIdx(prev => (prev + 1) % BRAIN_TEASERS.length);
              }}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
            >
              Next Riddle
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Hydration & Posture */}
      {activeTab === 'hydration' && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">Daily Hydration & Biometric Reset</h3>
            <p className="text-xs text-neutral-400">
              Cognitive stamina drops by up to 15% with even mild dehydration. Keep your brain hydrated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Water Tracker */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-sky-400">Hydration Log</span>
                <span className="text-xs font-mono text-neutral-400">{glasses} / 8 Glasses</span>
              </div>

              <div className="flex items-center justify-center gap-2 py-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (i >= glasses) handleLogWater();
                    }}
                    title={`Glass ${i + 1}`}
                    className={`w-8 h-12 rounded-b-md border transition-all cursor-pointer flex items-end justify-center pb-1 ${
                      i < glasses
                        ? 'border-sky-500 bg-sky-500/20 text-sky-300'
                        : 'border-neutral-800 bg-neutral-900 hover:border-sky-600 text-neutral-600'
                    }`}
                  >
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                ))}
              </div>

              <button
                onClick={handleLogWater}
                className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Droplets className="w-4 h-4" />
                <span>Drink a Glass (+1 Glass)</span>
              </button>
            </div>

            {/* Posture & Lighting Checklist */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-3">
              <span className="text-xs uppercase font-semibold text-emerald-400">Desk Environment Audit</span>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Eyes align with the top third of the monitor.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Feet flat on floor or footrest (no crossed legs).</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Shoulders dropped away from the ears.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Room illumination avoids glare directly behind monitor.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
