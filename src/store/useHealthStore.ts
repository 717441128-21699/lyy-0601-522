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

const STORAGE_KEY = 'health_app_state';

interface PersistedState {
  dailyRecords: DailyRecord[];
  goals: Goal[];
  courses: Course[];
  badges: Badge[];
  reminders: Reminder[];
  breathingSessions: BreathingSession[];
  privacySettings: PrivacySettings;
  userProfile: UserProfile;
}

const loadFromStorage = (): Partial<PersistedState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.log('[Store] 加载本地存储失败:', e);
  }
  return {};
};

const defaultPrivacySettings: PrivacySettings = {
  shareHealthData: false,
  allowNotifications: true,
  biometricAuth: false,
  dataEncryption: true,
  autoBackup: true,
};

const getDefaultState = (): PersistedState => ({
  dailyRecords: mockDailyRecords,
  goals: mockGoals,
  courses: mockCourses,
  badges: mockBadges,
  reminders: mockReminders,
  breathingSessions: [],
  privacySettings: defaultPrivacySettings,
  userProfile: mockProfile,
});

const saveToStorage = (state: Partial<PersistedState>) => {
  try {
    const existing = loadFromStorage();
    const defaults = getDefaultState();
    const data: PersistedState = {
      dailyRecords: state.dailyRecords ?? existing.dailyRecords ?? defaults.dailyRecords,
      goals: state.goals ?? existing.goals ?? defaults.goals,
      courses: state.courses ?? existing.courses ?? defaults.courses,
      badges: state.badges ?? existing.badges ?? defaults.badges,
      reminders: state.reminders ?? existing.reminders ?? defaults.reminders,
      breathingSessions: state.breathingSessions ?? existing.breathingSessions ?? defaults.breathingSessions,
      privacySettings: state.privacySettings ?? existing.privacySettings ?? defaults.privacySettings,
      userProfile: state.userProfile ?? existing.userProfile ?? defaults.userProfile,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('[Store] 已保存到本地存储:', Object.keys(state));
  } catch (e) {
    console.log('[Store] 保存本地存储失败:', e);
  }
};

const persistedState = loadFromStorage();

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

const defaultState = getDefaultState();

export const useHealthStore = create<HealthState>((set, get) => ({
  dailyRecords: persistedState.dailyRecords ?? defaultState.dailyRecords,
  goals: persistedState.goals ?? defaultState.goals,
  courses: persistedState.courses ?? defaultState.courses,
  badges: persistedState.badges ?? defaultState.badges,
  reminders: persistedState.reminders ?? defaultState.reminders,
  breathingSessions: persistedState.breathingSessions ?? defaultState.breathingSessions,
  privacySettings: persistedState.privacySettings ?? defaultState.privacySettings,
  userProfile: persistedState.userProfile ?? defaultState.userProfile,
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
    
    const newState = { 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    };
    set(newState);
    saveToStorage({ dailyRecords: records });
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
    
    const newState = { 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    };
    set(newState);
    saveToStorage({ dailyRecords: records });
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
    
    const newState = { 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    };
    set(newState);
    saveToStorage({ dailyRecords: records });
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
    
    const newState = { 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    };
    set(newState);
    saveToStorage({ dailyRecords: records });
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
    
    const newState = { 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    };
    set(newState);
    saveToStorage({ dailyRecords: records });
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
    
    const newState = { 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    };
    set(newState);
    saveToStorage({ dailyRecords: records });
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
    
    const newState = { 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    };
    set(newState);
    saveToStorage({ dailyRecords: records });
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
    
    const newState = { 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    };
    set(newState);
    saveToStorage({ dailyRecords: records });
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
    
    const newState = { 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    };
    set(newState);
    saveToStorage({ dailyRecords: records });
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
    
    const newState = { 
      dailyRecords: records,
      todayRecord: records.find(r => r.date === today) || null
    };
    set(newState);
    saveToStorage({ dailyRecords: records });
  },

  correctRecord: (date, record) => {
    const records = [...get().dailyRecords];
    const existingIndex = records.findIndex(r => r.date === date);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], ...record };
    }
    
    set({ dailyRecords: records });
    saveToStorage({ dailyRecords: records });
  },

  addGoal: (goal) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      current: 0,
    };
    const goals = [...get().goals, newGoal];
    set({ goals });
    saveToStorage({ goals });
  },

  updateGoalProgress: (id, current) => {
    const goals = get().goals.map(g => 
      g.id === id ? { ...g, current } : g
    );
    set({ goals });
    saveToStorage({ goals });
  },

  deleteGoal: (id) => {
    const goals = get().goals.filter(g => g.id !== id);
    set({ goals });
    saveToStorage({ goals });
  },

  toggleCourseFavorite: (id) => {
    const courses = get().courses.map(c => 
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    );
    set({ courses });
    saveToStorage({ courses });
  },

  markCourseCompleted: (id) => {
    const courses = get().courses.map(c => 
      c.id === id ? { ...c, timesCompleted: c.timesCompleted + 1 } : c
    );
    set({ courses });
    saveToStorage({ courses });
  },

  addBreathingSession: (type, duration) => {
    const session: BreathingSession = {
      id: `session-${Date.now()}`,
      type,
      duration,
      date: getTodayDate(),
      completed: true,
    };
    const breathingSessions = [...get().breathingSessions, session];
    set({ breathingSessions });
    saveToStorage({ breathingSessions });
  },

  toggleReminder: (id) => {
    const reminders = get().reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    set({ reminders });
    saveToStorage({ reminders });
  },

  updateReminder: (id, reminder) => {
    const reminders = get().reminders.map(r => 
      r.id === id ? { ...r, ...reminder } : r
    );
    set({ reminders });
    saveToStorage({ reminders });
  },

  updatePrivacySettings: (settings) => {
    const privacySettings = { ...get().privacySettings, ...settings };
    set({ privacySettings });
    saveToStorage({ privacySettings });
  },

  updateUserProfile: (profile) => {
    const userProfile = { ...get().userProfile, ...profile };
    set({ userProfile });
    saveToStorage({ userProfile });
  },
}));
