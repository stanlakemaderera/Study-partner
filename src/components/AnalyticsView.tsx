import React, { useState } from 'react';
import { FocusSession, UserProfile } from '../types';
import { 
  BarChart2, 
  Clock, 
  Calendar, 
  Star, 
  Download, 
  Filter, 
  PieChart,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface AnalyticsViewProps {
  sessions: FocusSession[];
  profile: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ sessions, profile }) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Compute metrics
  const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalFocusMinutes / 60).toFixed(1);

  // Today's focus minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutes = sessions
    .filter(s => s.startTime.startsWith(todayStr))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  // Subject breakdown
  const subjectMap: Record<string, number> = {};
  sessions.forEach(s => {
    const sub = s.subject || 'General';
    subjectMap[sub] = (subjectMap[sub] || 0) + s.durationMinutes;
  });

  const subjectsList = Object.keys(subjectMap).map(sub => ({
    name: sub,
    minutes: subjectMap[sub],
    hours: (subjectMap[sub] / 60).toFixed(1),
    percent: totalFocusMinutes > 0 ? Math.round((subjectMap[sub] / totalFocusMinutes) * 100) : 0
  })).sort((a, b) => b.minutes - a.minutes);

  // Last 7 days study data
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7DaysData = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = daysOfWeek[d.getDay()];

    const mins = sessions
      .filter(s => s.startTime.startsWith(dateStr))
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      date: dateStr,
      label: dayLabel,
      minutes: mins,
      hours: +(mins / 60).toFixed(1)
    };
  });

  const maxDailyMinutes = Math.max(120, ...last7DaysData.map(d => d.minutes));

  // Time of day breakdown
  const timeOfDay = {
    Morning: 0,   // 6 - 12
    Afternoon: 0, // 12 - 18
    Evening: 0,   // 18 - 24
    Night: 0      // 0 - 6
  };

  sessions.forEach(s => {
    const hour = new Date(s.startTime).getHours();
    if (hour >= 6 && hour < 12) timeOfDay.Morning += s.durationMinutes;
    else if (hour >= 12 && hour < 18) timeOfDay.Afternoon += s.durationMinutes;
    else if (hour >= 18 && hour < 24) timeOfDay.Evening += s.durationMinutes;
    else timeOfDay.Night += s.durationMinutes;
  });

  // Filtered session list
  const filteredSessions = sessions.filter(s => {
    if (selectedSubjectFilter === 'all') return true;
    return s.subject === selectedSubjectFilter;
  });

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `focus_sessions_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Title & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Learning & Cognitive Analytics</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Objective metrics tracking your deep work blocks, subject mastery, and cognitive stamina.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Study History</span>
        </button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Focus Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-mono tabular-nums font-bold text-white">
            {totalHours}h
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-mono">
            {totalFocusMinutes} total minutes
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Today's Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-mono tabular-nums font-bold text-white">
            {todayMinutes}m
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Target: {profile.dailyGoalMinutes}m ({Math.min(100, Math.round((todayMinutes / (profile.dailyGoalMinutes || 120)) * 100))}%)
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Completed Blocks</span>
            <CheckCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-mono tabular-nums font-bold text-white">
            {sessions.length}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Avg {sessions.length > 0 ? Math.round(totalFocusMinutes / sessions.length) : 0} mins / block
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Study Streak</span>
            <Calendar className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-mono tabular-nums font-bold text-white">
            {profile.currentStreak} Days
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Personal best: {profile.bestStreak} days
          </div>
        </div>
      </div>

      {/* Main Charts: 7-Day Trend + Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Focus Trend (Last 7 Days)</h3>
              <p className="text-xs text-neutral-400">Hours spent in uninterrupted study</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
              <span>Minutes</span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-6">
            <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 border-b border-neutral-800 pb-2">
              {last7DaysData.map(d => {
                const heightPercent = maxDailyMinutes > 0 ? (d.minutes / maxDailyMinutes) * 100 : 0;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-200 px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 font-mono">
                      {d.minutes} mins ({d.hours}h)
                    </div>

                    <div className="w-full flex items-end justify-center h-40">
                      <div
                        className="w-full max-w-[36px] bg-emerald-600/70 hover:bg-emerald-500 rounded-t-md transition-all duration-300"
                        style={{ height: `${Math.max(6, heightPercent)}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subject Mastery Breakdown */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Subject Mastery</h3>
            <PieChart className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="space-y-3 pt-2">
            {subjectsList.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No study sessions recorded yet.</p>
            ) : (
              subjectsList.map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-200 font-medium truncate">{item.name}</span>
                    <span className="text-neutral-400 font-mono tabular-nums">{item.hours}h ({item.percent}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Time of Day Heat Breakdown */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Circadian Productivity Distribution</h3>
        <p className="text-xs text-neutral-400">Discover when your brain enters peak flow states during the day.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {Object.entries(timeOfDay).map(([period, mins]) => (
            <div key={period} className="rounded-xl border border-neutral-800/80 bg-neutral-950 p-4">
              <div className="text-xs text-neutral-400">{period}</div>
              <div className="text-lg font-mono tabular-nums font-bold text-white mt-1">
                {mins} mins
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {totalFocusMinutes > 0 ? Math.round((mins / totalFocusMinutes) * 100) : 0}% of all focus
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Sessions History */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Focus Log History</h3>
            <p className="text-xs text-neutral-400">Audited archive of completed focus intervals</p>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedSubjectFilter}
              onChange={e => setSelectedSubjectFilter(e.target.value)}
              className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-neutral-600"
            >
              <option value="all">All Subjects</option>
              {subjectsList.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                <th className="pb-3 font-normal">Date & Time</th>
                <th className="pb-3 font-normal">Subject</th>
                <th className="pb-3 font-normal">Topic / Notes</th>
                <th className="pb-3 font-normal text-right">Duration</th>
                <th className="pb-3 font-normal text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-500 font-sans">
                    No sessions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredSessions.slice(0, 15).map(session => (
                  <tr key={session.id} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="py-3 text-neutral-400 whitespace-nowrap">
                      {new Date(session.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-neutral-200 font-sans font-medium whitespace-nowrap">
                      {session.subject}
                    </td>
                    <td className="py-3 text-neutral-400 font-sans max-w-xs truncate">
                      {session.topic || session.notes || '—'}
                    </td>
                    <td className="py-3 text-right text-emerald-400 tabular-nums whitespace-nowrap">
                      {session.durationMinutes} min
                    </td>
                    <td className="py-3 text-right text-amber-400 tabular-nums">
                      <div className="flex items-center justify-end gap-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{session.rating || 5}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
