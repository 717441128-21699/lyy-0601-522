export interface DailyRecord {
  id: string;
  date: string;
  mood: MoodType;
  stressLevel: number;
  energyLevel: number;
  steps: number;
  exerciseMinutes: number;
  sleepHours: number;
  sleepQuality: number;
  waterIntake: number;
  caffeineIntake: number;
  specialNote?: string;
  isPeriodDay?: boolean;
  checkInTime?: string;
}

export type MoodType = 'great' | 'good' | 'normal' | 'bad' | 'terrible';

export interface MoodOption {
  type: MoodType;
  label: string;
  emoji: string;
  color: string;
}

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  target: number;
  current: number;
  unit: string;
  startDate: string;
  endDate: string;
  reminder: boolean;
  reminderTime?: string;
}

export type GoalType = 'steps' | 'exercise' | 'sleep' | 'water' | 'weight';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl: string;
  isFavorite: boolean;
  timesCompleted: number;
}

export type CourseCategory = 'breathing' | 'meditation' | 'stretching' | 'strength';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  target: number;
}

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  time: string;
  enabled: boolean;
  repeat: 'daily' | 'weekdays' | 'weekends' | 'once';
}

export type ReminderType = 'water' | 'sedentary' | 'sleep' | 'wakeup' | 'exercise';

export interface BreathingSession {
  id: string;
  type: BreathingType;
  duration: number;
  date: string;
  completed: boolean;
}

export type BreathingType = 'calm' | 'energy' | 'focus' | 'sleep';

export interface HealthReport {
  period: 'week' | 'month';
  startDate: string;
  endDate: string;
  avgSteps: number;
  avgSleep: number;
  avgStress: number;
  avgMood: number;
  avgWater: number;
  exerciseDays: number;
  totalExerciseMinutes: number;
  suggestions: string[];
}

export interface PrivacySettings {
  shareHealthData: boolean;
  allowNotifications: boolean;
  biometricAuth: boolean;
  dataEncryption: boolean;
  autoBackup: boolean;
}

export interface UserProfile {
  name: string;
  avatar?: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  weight: number;
  targetWeight?: number;
}
