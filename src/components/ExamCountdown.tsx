import React, { useState, useEffect } from 'react';
import { ExamCountdown as ExamCountdownType, ExamTopic } from '../types';
import { fireCelebrationConfetti } from '../utils/gamification';
import { soundEngine } from '../utils/audio';
import { 
  CalendarClock, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Award, 
  Trash2,
  BookmarkCheck,
  Sparkles
} from 'lucide-react';

interface ExamCountdownProps {
  exams: ExamCountdownType[];
  onUpdateExams: (exams: ExamCountdownType[]) => void;
  onUnlockBadge?: (badgeId: string) => void;
  subjects?: string[];
}

export const ExamCountdown: React.FC<ExamCountdownProps> = ({
  exams,
  onUpdateExams,
  onUnlockBadge,
  subjects = ['Mathematics', 'Computer Science', 'Biology', 'Physics', 'Chemistry', 'Literature']
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [isAddingExam, setIsAddingExam] = useState<boolean>(false);

  // New exam form state
  const [title, setTitle] = useState<string>('');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [dateStr, setDateStr] = useState<string>('');
  const [targetGrade, setTargetGrade] = useState<string>('A / 90%+');
  const [notes, setNotes] = useState<string>('');
  const [newTopicName, setNewTopicName] = useState<string>('');
  const [activeTopicInputExamId, setActiveTopicInputExamId] = useState<string | null>(null);

  // Live timer tick every second for crisp countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeLeft = (targetIso: string) => {
    const diff = new Date(targetIso).getTime() - now.getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isPast: false };
  };

  const handleToggleTopic = (examId: string, topicId: string) => {
    soundEngine.playTick();
    const updated = exams.map(exam => {
      if (exam.id !== examId) return exam;

      const updatedTopics = exam.topics.map(t => {
        if (t.id === topicId) return { ...t, completed: !t.completed };
        return t;
      });

      // Check if all topics completed
      const allCompleted = updatedTopics.length > 0 && updatedTopics.every(t => t.completed);
      if (allCompleted) {
        fireCelebrationConfetti();
        soundEngine.playChime('bowl');
        if (onUnlockBadge) onUnlockBadge('exam_architect');
      }

      return { ...exam, topics: updatedTopics };
    });

    onUpdateExams(updated);
  };

  const handleAddTopic = (examId: string) => {
    if (!newTopicName.trim()) return;

    const newTopic: ExamTopic = {
      id: 'top-' + Date.now(),
      name: newTopicName.trim(),
      completed: false
    };

    const updated = exams.map(exam => {
      if (exam.id !== examId) return exam;
      return { ...exam, topics: [...exam.topics, newTopic] };
    });

    onUpdateExams(updated);
    setNewTopicName('');
    setActiveTopicInputExamId(null);
  };

  const handleDeleteExam = (examId: string) => {
    if (confirm('Are you sure you want to remove this exam countdown?')) {
      onUpdateExams(exams.filter(e => e.id !== examId));
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateStr) {
      alert('Please fill in Exam Name and Date.');
      return;
    }

    const newExam: ExamCountdownType = {
      id: 'exam-' + Date.now(),
      title: title.trim(),
      subject,
      date: new Date(dateStr).toISOString(),
      targetGrade: targetGrade.trim() || undefined,
      notes: notes.trim() || undefined,
      topics: [
        { id: 'top-' + Date.now() + '-1', name: 'Comprehensive Syllabus Review', completed: false },
        { id: 'top-' + Date.now() + '-2', name: 'Practice Mock Exam Papers', completed: false },
        { id: 'top-' + Date.now() + '-3', name: 'Weak Points Revision', completed: false }
      ]
    };

    onUpdateExams([...exams, newExam]);
    setIsAddingExam(false);
    setTitle('');
    setDateStr('');
    setNotes('');
    soundEngine.playChime('bell');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title & Add Exam Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Final Exam Countdowns & Syllabi</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Calibrate your study intensity against exact exam deadlines and systematically conquer milestones.
          </p>
        </div>

        <button
          onClick={() => setIsAddingExam(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Final Exam</span>
        </button>
      </div>

      {/* Motivational Exam Wisdom Box */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          <strong>Exam Mastery Rule:</strong> Consistent 45-minute daily deliberate practice delivers 4x greater memory retention than 12-hour last-minute cramming sessions. You have plenty of time if you protect today's study block.
        </p>
      </div>

      {/* Add Exam Modal Form */}
      {isAddingExam && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Create New Exam Target</h3>
          <form onSubmit={handleCreateExam} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-neutral-400">Exam Title / Course</label>
              <input
                type="text"
                placeholder="e.g. Final Examination: Organic Chemistry II"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Subject Category</label>
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

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Exam Date & Time</label>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                required
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Target Grade / Score</label>
              <input
                type="text"
                placeholder="e.g. A* / 95%"
                value={targetGrade}
                onChange={e => setTargetGrade(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Exam Venue / Notes</label>
              <input
                type="text"
                placeholder="e.g. Main Hall 3, bring scientific calculator"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingExam(false)}
                className="px-4 py-2 border border-neutral-800 rounded-lg text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Save Exam Countdown
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exam Countdown Cards List */}
      <div className="space-y-6">
        {exams.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-12 text-center space-y-3">
            <CalendarClock className="w-8 h-8 text-neutral-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Upcoming Exams Configured</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Add your upcoming final exams to track countdown days, hours, and syllabus checklists.
            </p>
            <button
              onClick={() => setIsAddingExam(true)}
              className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white rounded-lg transition-colors"
            >
              Add First Exam
            </button>
          </div>
        ) : (
          exams.map(exam => {
            const timeLeft = calculateTimeLeft(exam.date);
            const isUrgent = !timeLeft.isPast && timeLeft.days < 7;
            const completedTopics = exam.topics.filter(t => t.completed).length;
            const progressPercent = exam.topics.length > 0 
              ? Math.round((completedTopics / exam.topics.length) * 100) 
              : 0;

            const examDateFormatted = new Date(exam.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const examTimeFormatted = new Date(exam.date).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={exam.id}
                className={`rounded-2xl border p-6 space-y-6 transition-all ${
                  isUrgent 
                    ? 'border-amber-600/70 bg-neutral-900/60 shadow-lg shadow-amber-950/20'
                    : 'border-neutral-800 bg-neutral-900/40'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider font-mono">
                        {exam.subject}
                      </span>
                      {isUrgent && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Final Stretch (&lt; 7 Days)</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{exam.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                      <span>{examDateFormatted} at {examTimeFormatted}</span>
                      {exam.notes && (
                        <>
                          <span>·</span>
                          <span>{exam.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {exam.targetGrade && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Target: {exam.targetGrade}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      title="Delete Exam"
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Countdown Digit Blocks */}
                {timeLeft.isPast ? (
                  <div className="py-4 text-center text-sm font-semibold text-neutral-400">
                    Exam Date Reached / Concluded
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto text-center">
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 sm:p-4">
                      <div className="text-2xl sm:text-4xl font-mono tabular-nums font-bold text-white">
                        {timeLeft.days.toString().padStart(2, '0')}
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase mt-1">
                        Days
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 sm:p-4">
                      <div className="text-2xl sm:text-4xl font-mono tabular-nums font-bold text-white">
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase mt-1">
                        Hours
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 sm:p-4">
                      <div className="text-2xl sm:text-4xl font-mono tabular-nums font-bold text-white">
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase mt-1">
                        Mins
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 sm:p-4">
                      <div className="text-2xl sm:text-4xl font-mono tabular-nums font-bold text-emerald-400">
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase mt-1">
                        Secs
                      </div>
                    </div>
                  </div>
                )}

                {/* Syllabus Progress Bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                      <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                      <span>Syllabus Mastery Checklist</span>
                    </span>
                    <span className="font-mono text-neutral-400">
                      {completedTopics} of {exam.topics.length} topics mastered ({progressPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Topics Checklist Items */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {exam.topics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => handleToggleTopic(exam.id, topic.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          topic.completed
                            ? 'border-neutral-800 bg-neutral-950/40 text-neutral-400'
                            : 'border-neutral-800/80 bg-neutral-950 hover:border-neutral-700 text-neutral-200'
                        }`}
                      >
                        {topic.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-500 shrink-0" />
                        )}
                        <span className={`text-xs ${topic.completed ? 'line-through text-neutral-500' : ''}`}>
                          {topic.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Add Topic Inline */}
                  {activeTopicInputExamId === exam.id ? (
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add topic (e.g. Chapter 6: Thermodynamics)..."
                        value={newTopicName}
                        onChange={e => setNewTopicName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-600"
                      />
                      <button
                        onClick={() => handleAddTopic(exam.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setActiveTopicInputExamId(null);
                          setNewTopicName('');
                        }}
                        className="px-3 py-1.5 border border-neutral-800 text-xs text-neutral-400 hover:text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveTopicInputExamId(exam.id)}
                      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-400 transition-colors pt-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Syllabus Milestone Topic</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
