
import { toast } from 'sonner';

export interface TimerSession {
  id: string;
  duration: number;
  date: string;
  type: 'work' | 'break';
}

export type NotificationSound = 'beep' | 'chime' | 'bell' | 'chirp' | 'ding';

const SOUND_URLS = {
  beep: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3',
  chime: 'https://assets.mixkit.co/sfx/preview/mixkit-musical-notification-alert-2308.mp3',
  bell: 'https://assets.mixkit.co/sfx/preview/mixkit-classic-short-alarm-993.mp3',
  chirp: 'https://assets.mixkit.co/sfx/preview/mixkit-cheerful-notification-tone-2305.mp3',
  ding: 'https://assets.mixkit.co/sfx/preview/mixkit-interface-hint-notification-911.mp3'
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  
  return [
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ].join(':');
};

export const saveSession = (sessions: TimerSession[], newSession: TimerSession): TimerSession[] => {
  const updatedSessions = [newSession, ...sessions.slice(0, 9)];
  localStorage.setItem('timerSessions', JSON.stringify(updatedSessions));
  return updatedSessions;
};

export const loadSessions = (): TimerSession[] => {
  const savedSessions = localStorage.getItem('timerSessions');
  return savedSessions ? JSON.parse(savedSessions) : [];
};

export const saveNotificationSound = (sound: NotificationSound): void => {
  localStorage.setItem('timerNotificationSound', sound);
};

export const loadNotificationSound = (): NotificationSound => {
  const savedSound = localStorage.getItem('timerNotificationSound');
  return (savedSound as NotificationSound) || 'beep';
};

export const notifySessionCompletion = (mode: 'work' | 'break', duration: number): void => {
  const modeEmoji = mode === 'work' ? '💼' : '☕';
  toast(`${mode === 'work' ? 'Work' : 'Break'} session completed! ${modeEmoji}`, {
    description: `Duration: ${formatTime(duration)}`,
  });
};

export const playNotificationSound = (sound: NotificationSound = 'beep'): void => {
  const soundUrl = SOUND_URLS[sound] || SOUND_URLS.beep;
  const audio = new Audio(soundUrl);
  audio.play();
};

