import { AppNotification, NotificationSettings } from '../types/auth';
import { soundEngine } from './audio';

const STORAGE_KEY_NOTIFICATIONS = 'stanlake_notifications_history_v1';
const STORAGE_KEY_SETTINGS = 'stanlake_notification_settings_v1';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  browserNotificationsEnabled: false,
  sessionEndReminders: true,
  breakReminders: true,
  examDeadlineAlerts: true,
  periodicNudges: true,
  nudgeIntervalMinutes: 25,
};

export function loadNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings', e);
  }
}

export function loadNotificationHistory(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) {
      // Seed friendly welcome reminder
      return [
        {
          id: 'notif-welcome',
          title: 'Welcome to Stanlake Focus',
          body: 'Your study progress and exam countdowns are now smoothly synchronized with your account.',
          timestamp: new Date().toISOString(),
          type: 'system',
          read: false
        }
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotificationHistory(history: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save notification history', e);
  }
}

export async function requestBrowserPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission {
  if (!isBrowserNotificationSupported()) return 'denied';
  return Notification.permission;
}

export function triggerNotification(
  title: string,
  body: string,
  type: AppNotification['type'] = 'system',
  settings?: NotificationSettings
): AppNotification {
  const currentSettings = settings || loadNotificationSettings();
  const newNotif: AppNotification = {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    title,
    body,
    timestamp: new Date().toISOString(),
    type,
    read: false
  };

  // 1. Save to in-app history
  const history = loadNotificationHistory();
  saveNotificationHistory([newNotif, ...history]);

  // 2. Play audio notification chime
  try {
    soundEngine.playChime('bell');
  } catch {}

  // 3. Send system browser notification if enabled
  if (
    currentSettings.browserNotificationsEnabled &&
    isBrowserNotificationSupported() &&
    Notification.permission === 'granted'
  ) {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: type,
        silent: false
      });
    } catch (e) {
      console.debug('Browser notification failed:', e);
    }
  }

  return newNotif;
}
