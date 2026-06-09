import { create } from 'zustand';
import dayjs from 'dayjs';
import type {
  DailyRecord,
  Goal,
  Course,
  Badge,
  Reminder,
  BreathingSession,
  PrivacySettings,
  UserProfile,
  MoodType,
} from '@/types/health';
import { mockDailyRecords, mockGoals, mockCourses, mockBadges, mockReminders, mockProfile } from '@/data/mockHealth';

interface HealthState {
  dailyRecords: DailyRecord[];
  goals: Goal[];
  courses: Course[];
  badges: Badge[];
  reminders: Reminder[];
  breathingSessions: BreathingSession[];
  privacySettings: PrivacySettings;
  userProfile: UserProfile;
  todayRecord: DailyRecord | null;

  setTodayMood: (mood: MoodType) => void;
  setTodayStress: (level: number) => void;
  setTodayEnergy: (level: number) => void;
  setTodaySteps: (steps: number) => void;
  setTodayExercise: (minutes: number) => void;
  setTodaySleep: (hours: number, quality: number) => void;
  setTodayWater: (intake: number) => void;
  setTodayCaffeine: (intake: number) => void;
  setTodaySpecialNote: (note: string, isPeriod?: boolean) => void;
  checkInToday: () => void;
  correctRecord: (date: string, record: Partial<DailyRecord>) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'current'>) => void;
  updateGoalProgress: (id: string, current: number) => void;
  deleteGoal: (id: string) => void;

  toggleCourseFavorite: (id: string) => void;
  markCourseCompleted: (id: string) => void;

  addBreathingSession: (type: BreathingSession['type'], duration: number) => void;

  toggleReminder: (id: string) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;

  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  loadTodayRecord: () => void;
}

const getTodayDate = () => dayjs().format('YYYY-MM-DD');

const createEmptyTodayRecord = (): DailyRecord => ({
  id: `record-${getTodayDate()}`,
  date: getTodayDate(),
  mood: 'normal',
  stressLevel: 5,
  energyLevel: 5,
  steps: 0,
  exerciseMinutes: 0,
  sleepHours: 0,
  sleepQuality: 5,
  waterIntake: 0,
  caffeineIntake: 0,
});

export const useHealthStore = create<HealthState>((set, get) => ({
  dailyRecords: mockDailyRecords,
  goals: mockGoals,
  courses: mockCourses,
  badges: mockBadges,
  reminders: mockReminders,
  breathingSessions: [],
  privacySettings: {
    shareHealthData: false,
    allowNotifications: true,
    biometricAuth: false,
    dataEncryption: true,
    autoBackup: true,
  },
  userProfile: mockProfile,
  todayRecord: null,

  loadTodayRecord: () => {
    const today = getTodayDate();
    const existing = get().dailyRecords.find(r => r.date === today);
    set({ todayRecord: existing || createEmptyTodayRecord() });
  },

  setTodayMood: (mood) => {
    const today = getTodayDate();
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === today);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], mood };
    } else {
      records.push({ ...createEmptyTodayRecord(), mood });
    }
    
    set({ 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    });
  },

  setTodayStress: (level) => {
    const today = getTodayDate();
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === today);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], stressLevel: level };
    } else {
      records.push({ ...createEmptyTodayRecord(), stressLevel: level });
    }
    
    set({ 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    });
  },

  setTodayEnergy: (level) => {
    const today = getTodayDate();
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === today);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], energyLevel: level };
    } else {
      records.push({ ...createEmptyTodayRecord(), energyLevel: level });
    }
    
    set({ 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    });
  },

  setTodaySteps: (steps) => {
    const today = getTodayDate();
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === today);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], steps };
    } else {
      records.push({ ...createEmptyTodayRecord(), steps });
    }
    
    set({ 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    });
  },

  setTodayExercise: (minutes) => {
    const today = getTodayDate();
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === today);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], exerciseMinutes: minutes };
    } else {
      records.push({ ...createEmptyTodayRecord(), exerciseMinutes: minutes });
    }
    
    set({ 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    });
  },

  setTodaySleep: (hours, quality) => {
    const today = getTodayDate();
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === today);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], sleepHours: hours, sleepQuality: quality };
    } else {
      records.push({ ...createEmptyTodayRecord(), sleepHours: hours, sleepQuality: quality });
    }
    
    set({ 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    });
  },

  setTodayWater: (intake) => {
    const today = getTodayDate();
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === today);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], waterIntake: intake };
    } else {
      records.push({ ...createEmptyTodayRecord(), waterIntake: intake });
    }
    
    set({ 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    });
  },

  setTodayCaffeine: (intake) => {
    const today = getTodayDate();
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === today);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], caffeineIntake: intake };
    } else {
      records.push({ ...createEmptyTodayRecord(), caffeineIntake: intake });
    }
    
    set({ 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    });
  },

  setTodaySpecialNote: (note, isPeriod) => {
    const today = getTodayDate();
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === today);
    const updateData: Partial<DailyRecord> = { specialNote: note };
    if (isPeriod !== undefined) updateData.isPeriodDay = isPeriod;
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], ...updateData };
    } else {
      records.push({ ...createEmptyTodayRecord(), ...updateData });
    }
    
    set({ 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    });
  },

  checkInToday: () => {
    const today = getTodayDate();
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === today);
    const checkInTime = dayjs().format('HH:mm');
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], checkInTime };
    } else {
      records.push({ ...createEmptyTodayRecord(), checkInTime });
    }
    
    set({ 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    });
  },

  correctRecord: (date, record) => {
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === date);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], ...record };
    }
    
    set({ dailyRecords: records });
  },

  addGoal: (goal) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      current: 0,
    };
    set({ goals: [...get().goals, newGoal] });
  },

  updateGoalProgress: (id, current) => {
    const goals = get().goals.map(g => 
      g.id === id ? { ...g, current } : g
    );
    set({ goals });
  },

  deleteGoal: (id) => {
    set({ goals: get().goals.filter(g => g.id !== id) });
  },

  toggleCourseFavorite: (id) => {
    const courses = get().courses.map(c => 
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    );
    set({ courses });
  },

  markCourseCompleted: (id) => {
    const courses = get().courses.map(c => 
      c.id === id ? { ...c, timesCompleted: c.timesCompleted + 1 } : c
    );
    set({ courses });
  },

  addBreathingSession: (type, duration) => {
    const session: BreathingSession = {
      id: `session-${Date.now()}`,
      type,
      duration,
      date: getTodayDate(),
      completed: true,
    };
    set({ breathingSessions: [...get().breathingSessions, session] });
  },

  toggleReminder: (id) => {
    const reminders = get().reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    set({ reminders });
  },

  updateReminder: (id, reminder) => {
    const reminders = get().reminders.map(r => 
      r.id === id ? { ...r, ...reminder } : r
    );
    set({ reminders });
  },

  updatePrivacySettings: (settings) => {
    set({ privacySettings: { ...get().privacySettings, ...settings } });
  },

  updateUserProfile: (profile) => {
    set({ userProfile: { ...get().userProfile, ...profile } });
  },
}));
