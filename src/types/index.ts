export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

export const TIME_DISPLAY: Record<TimeOfDay, string> = {
  morning: '8:00 AM',
  afternoon: '12:00 PM',
  evening: '6:00 PM',
  night: '10:00 PM',
};

export const TIME_EMOJI: Record<TimeOfDay, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌆',
  night: '🌙',
};

export const MEDICINE_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#F7DC6F',
  '#DDA0DD',
  '#98D8C8',
  '#F0A500',
  '#7EC8E3',
  '#FF8C94',
];

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  times: TimeOfDay[];
  color: string;
  notes: string;
  active: boolean;
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medicineId: string;
  date: string;      // YYYY-MM-DD
  time: TimeOfDay;
  taken: boolean;
  takenAt: string | null;
}
