import dayjs from 'dayjs';
import type { DailyRecord, MoodType, HealthReport } from '@/types/health';

export const moodOptions = [
  { type: 'great' as MoodType, label: '很棒', emoji: '😄', color: '#22C55E' },
  { type: 'good' as MoodType, label: '不错', emoji: '😊', color: '#4ADE80' },
  { type: 'normal' as MoodType, label: '一般', emoji: '😐', color: '#F59E0B' },
  { type: 'bad' as MoodType, label: '不好', emoji: '😔', color: '#F97316' },
  { type: 'terrible' as MoodType, label: '很差', emoji: '😢', color: '#EF4444' },
];

export const getMoodInfo = (mood: MoodType) => {
  return moodOptions.find(m => m.type === mood) || moodOptions[2];
};

export const getMoodScore = (mood: MoodType): number => {
  const scores: Record<MoodType, number> = {
    great: 5,
    good: 4,
    normal: 3,
    bad: 2,
    terrible: 1,
  };
  return scores[mood] || 3;
};

export const getStressLevelText = (level: number): string => {
  if (level <= 2) return '放松';
  if (level <= 4) return '轻松';
  if (level <= 6) return '适中';
  if (level <= 8) return '较高';
  return '很高';
};

export const getStressLevelColor = (level: number): string => {
  if (level <= 2) return '#22C55E';
  if (level <= 4) return '#4ADE80';
  if (level <= 6) return '#F59E0B';
  if (level <= 8) return '#F97316';
  return '#EF4444';
};

export const getSleepQualityText = (quality: number): string => {
  if (quality <= 2) return '很差';
  if (quality <= 4) return '一般';
  if (quality <= 6) return '良好';
  if (quality <= 8) return '优秀';
  return '完美';
};

export const getSleepQualityColor = (quality: number): string => {
  if (quality <= 2) return '#EF4444';
  if (quality <= 4) return '#F97316';
  if (quality <= 6) return '#F59E0B';
  if (quality <= 8) return '#4ADE80';
  return '#22C55E';
};

export const calculateWeeklyReport = (records: DailyRecord[]): HealthReport => {
  const weekRecords = records.slice(-7);
  const validRecords = weekRecords.filter(r => r.steps > 0 || r.sleepHours > 0);
  
  const avgSteps = validRecords.length > 0 
    ? Math.round(validRecords.reduce((sum, r) => sum + r.steps, 0) / validRecords.length)
    : 0;
  
  const avgSleep = validRecords.length > 0
    ? Number((validRecords.reduce((sum, r) => sum + r.sleepHours, 0) / validRecords.length).toFixed(1))
    : 0;
  
  const avgStress = validRecords.length > 0
    ? Number((validRecords.reduce((sum, r) => sum + r.stressLevel, 0) / validRecords.length).toFixed(1))
    : 0;
  
  const avgMood = validRecords.length > 0
    ? Number((validRecords.reduce((sum, r) => sum + getMoodScore(r.mood), 0) / validRecords.length).toFixed(1))
    : 0;
  
  const exerciseDays = weekRecords.filter(r => r.exerciseMinutes > 0).length;
  const totalExerciseMinutes = weekRecords.reduce((sum, r) => sum + r.exerciseMinutes, 0);
  
  const suggestions: string[] = [];
  
  if (avgSteps < 6000) {
    suggestions.push('本周平均步数偏低，建议增加日常活动量，每天多走几步。');
  }
  if (avgSleep < 7) {
    suggestions.push('睡眠时长不足7小时，建议调整作息，保证充足睡眠。');
  }
  if (avgStress > 6) {
    suggestions.push('压力水平较高，建议多做呼吸训练和冥想放松。');
  }
  if (exerciseDays < 3) {
    suggestions.push('运动天数较少，建议每周至少运动3次，保持身体健康。');
  }
  if (avgMood < 3) {
    suggestions.push('心情评分偏低，可以尝试记录让自己开心的小事。');
  }
  if (suggestions.length === 0) {
    suggestions.push('继续保持良好的生活习惯，你做得很棒！');
  }
  
  return {
    period: 'week',
    startDate: weekRecords[0]?.date || dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
    endDate: weekRecords[weekRecords.length - 1]?.date || dayjs().format('YYYY-MM-DD'),
    avgSteps,
    avgSleep,
    avgStress,
    avgMood,
    exerciseDays,
    totalExerciseMinutes,
    suggestions,
  };
};

export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const getBMILevel = (bmi: number): { text: string; color: string } => {
  if (bmi < 18.5) return { text: '偏瘦', color: '#3B82F6' };
  if (bmi < 24) return { text: '正常', color: '#22C55E' };
  if (bmi < 28) return { text: '偏胖', color: '#F59E0B' };
  return { text: '肥胖', color: '#EF4444' };
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
  }
  return `${mins}分钟`;
};

export const getGoalTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    steps: '👟',
    exercise: '💪',
    sleep: '😴',
    water: '💧',
    weight: '⚖️',
  };
  return icons[type] || '🎯';
};

export const getCourseCategoryText = (category: string): string => {
  const texts: Record<string, string> = {
    breathing: '呼吸训练',
    meditation: '冥想',
    stretching: '拉伸',
    strength: '力量训练',
  };
  return texts[category] || category;
};

export const getDifficultyText = (difficulty: string): string => {
  const texts: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };
  return texts[difficulty] || difficulty;
};

export const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    easy: '#22C55E',
    medium: '#F59E0B',
    hard: '#EF4444',
  };
  return colors[difficulty] || '#86909C';
};

export const getReminderTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    water: '💧',
    sedentary: '🚶',
    sleep: '🌙',
    wakeup: '☀️',
    exercise: '🏃',
  };
  return icons[type] || '⏰';
};

export const getRepeatText = (repeat: string): string => {
  const texts: Record<string, string> = {
    daily: '每天',
    weekdays: '工作日',
    weekends: '周末',
    once: '仅一次',
  };
  return texts[repeat] || repeat;
};
