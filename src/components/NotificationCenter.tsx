import React, { useState } from 'react';
import { AppNotification, NotificationSettings } from '../types/auth';
import { 
  getBrowserNotificationPermission, 
  isBrowserNotificationSupported, 
  requestBrowserPermission, 
  triggerNotification 
} from '../utils/notifications';
import { 
  Bell, 
  X, 
  Check, 
  Volume2, 
  CalendarClock, 
  Sparkles, 
  Coffee, 
  Trash2, 
  ExternalLink,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onClearNotifications: () => void;
  onMarkAllRead: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearNotifications,
  onMarkAllRead,
  settings,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [permissionState, setPermissionState] = useState<NotificationPermission>(getBrowserNotificationPermission());

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestBrowserPermission();
    setPermissionState(getBrowserNotificationPermission());
    if (granted) {
      onUpdateSettings({ ...settings, browserNotificationsEnabled: true });
      triggerNotification(
        'Notifications Activated!',
        'You will now receive timely reminders for focus sessions and exam countdowns.',
        'system',
        { ...settings, browserNotificationsEnabled: true }
      );
    }
  };

  const handleSendTestNotification = () => {
    triggerNotification(
      'Focus Reminder Test',
      'This is how your exam deadlines and focus sprint alerts will appear.',
      'session',
      settings
    );
  };

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'exam':
        return <CalendarClock className="w-4 h-4 text-amber-400" />;
      case 'break':
        return <Coffee className="w-4 h-4 text-sky-400" />;
      case 'session':
        return <Clock className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-7 space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Study Reminders & Notifications</h3>
              <p className="text-xs text-neutral-400">Keep your momentum high and exam countdowns in sight</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Activity Stream ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Reminder Settings
          </button>
        </div>

        {/* Tab 1: Notifications List */}
        {activeTab === 'notifications' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <span>Recent Alerts</span>
              {notifications.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={onMarkAllRead}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={onClearNotifications}
                    className="hover:text-rose-400 transition-colors"
                  >
                    Clear history
                  </button>
                </div>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-neutral-700" />
                <p>No new notifications yet. You're fully caught up!</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    notif.read
                      ? 'border-neutral-800/60 bg-neutral-900/30 text-neutral-400'
                      : 'border-emerald-800/60 bg-neutral-900/80 text-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0 mt-0.5">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-neutral-100">{notif.title}</h4>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{notif.body}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Settings */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* System Browser Notifications Banner */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-white">Browser Push Notifications</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Send desktop notifications even when you are reviewing notes in another browser tab.
                  </p>
                </div>
                <div className="shrink-0">
                  {permissionState === 'granted' ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" /> Enabled
                    </span>
                  ) : (
                    <button
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Enable Browser Alerts
                    </button>
                  )}
                </div>
              </div>

              {permissionState === 'granted' && (
                <button
                  onClick={handleSendTestNotification}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Send test reminder</span>
                </button>
              )}
            </div>

            {/* Notification triggers options */}
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/30 cursor-pointer">
                <div>
                  <div className="font-medium text-white">Focus Sprint Completion Alerts</div>
                  <div className="text-neutral-400 text-[11px]">Notify when 25m or 50m focus blocks finish</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sessionEndReminders}
                  onChange={e => onUpdateSettings({ ...settings, sessionEndReminders: e.target.checked })}
                  className="rounded border-neutral-700 bg-neutral-950 text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/30 cursor-pointer">
                <div>
                  <div className="font-medium text-white">Break & Rest Reminders</div>
                  <div className="text-neutral-400 text-[11px]">Prompt you to stretch, breathe, and hydrate</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.breakReminders}
                  onChange={e => onUpdateSettings({ ...settings, breakReminders: e.target.checked })}
                  className="rounded border-neutral-700 bg-neutral-950 text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/30 cursor-pointer">
                <div>
                  <div className="font-medium text-white">Final Exam Countdown Proximity</div>
                  <div className="text-neutral-400 text-[11px]">Alert when exam countdown drops below 7 days, 3 days, 24 hours</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.examDeadlineAlerts}
                  onChange={e => onUpdateSettings({ ...settings, examDeadlineAlerts: e.target.checked })}
                  className="rounded border-neutral-700 bg-neutral-950 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-900 text-center text-[11px] text-neutral-500 shrink-0">
          Created by Stanlake T.Maderera
        </div>
      </div>
    </div>
  );
};
