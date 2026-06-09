import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Switch, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useHealthStore } from '@/store/useHealthStore';
import type { BreathingType } from '@/types/health';

const breathingModes = [
  {
    type: 'calm' as BreathingType,
    name: '平静放松',
    icon: '🌿',
    color: '#22C55E',
    desc: '缓解焦虑，平静心情',
    pattern: { inhale: 4, hold: 4, exhale: 4 },
  },
  {
    type: 'energy' as BreathingType,
    name: '精力提升',
    icon: '⚡',
    color: '#F59E0B',
    desc: '快速提升能量和警觉性',
    pattern: { inhale: 4, hold: 0, exhale: 2 },
  },
  {
    type: 'focus' as BreathingType,
    name: '专注冥想',
    icon: '🧘',
    color: '#8B5CF6',
    desc: '提升专注力和注意力',
    pattern: { inhale: 4, hold: 4, exhale: 6 },
  },
  {
    type: 'sleep' as BreathingType,
    name: '助眠放松',
    icon: '🌙',
    color: '#06B6D4',
    desc: '帮助放松身心，快速入睡',
    pattern: { inhale: 4, hold: 7, exhale: 8 },
  },
];

const durations = [3, 5, 10, 15];

const TrainingPage: React.FC = () => {
  const {
    breathingSessions,
    reminders,
    addBreathingSession,
    toggleReminder,
    updateReminder,
  } = useHealthStore();

  const [selectedMode, setSelectedMode] = useState<BreathingType>('calm');
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [phaseText, setPhaseText] = useState('准备开始');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const weeklyMinutes = breathingSessions.reduce((sum, s) => sum + s.duration, 0);
  const weeklyCount = breathingSessions.length;
  const sedentaryReminder = reminders.find(r => r.type === 'sedentary');

  const startBreathing = () => {
    console.log('[Training] 开始呼吸训练:', selectedMode, selectedDuration);
    setIsBreathing(true);
    setTimeLeft(selectedDuration * 60);
    setPhaseText('准备开始');
    
    setTimeout(() => {
      runBreathingCycle();
    }, 2000);
  };

  const runBreathingCycle = () => {
    const mode = breathingModes.find(m => m.type === selectedMode);
    if (!mode) return;

    let currentPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    let phaseTime = 0;

    const cycle = () => {
      if (timeLeft <= 0) {
        stopBreathing();
        return;
      }

      const pattern = mode.pattern;
      let phaseDuration: number;

      switch (currentPhase) {
        case 'inhale':
          phaseDuration = pattern.inhale;
          setPhaseText('吸气');
          setBreathingPhase('inhale');
          break;
        case 'hold':
          if (pattern.hold === 0) {
            currentPhase = 'exhale';
            cycle();
            return;
          }
          phaseDuration = pattern.hold;
          setPhaseText('屏息');
          setBreathingPhase('hold');
          break;
        case 'exhale':
          phaseDuration = pattern.exhale;
          setPhaseText('呼气');
          setBreathingPhase('exhale');
          break;
      }

      phaseTime = phaseDuration;

      const phaseInterval = setInterval(() => {
        phaseTime--;
        if (phaseTime <= 0) {
          clearInterval(phaseInterval);
          if (currentPhase === 'inhale') {
            currentPhase = 'hold';
          } else if (currentPhase === 'hold') {
            currentPhase = 'exhale';
          } else {
            currentPhase = 'inhale';
          }
          cycle();
        }
      }, 1000);

      timerRef.current = phaseInterval as unknown as NodeJS.Timeout;
    };

    cycle();

    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopBreathing = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const completedTime = selectedDuration * 60 - timeLeft;
    if (completedTime > 0) {
      addBreathingSession(selectedMode, Math.ceil(completedTime / 60));
      Taro.showToast({
        title: `训练完成！${Math.ceil(completedTime / 60)}分钟`,
        icon: 'success',
      });
    }
    
    setIsBreathing(false);
    setBreathingPhase('inhale');
    setPhaseText('准备开始');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentMode = breathingModes.find(m => m.type === selectedMode);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>⏱️</Text>
          <Text className={styles.statValue}>{weeklyMinutes}</Text>
          <Text className={styles.statLabel}>本周训练（分钟）</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>🎯</Text>
          <Text className={styles.statValue}>{weeklyCount}</Text>
          <Text className={styles.statLabel}>本周训练（次）</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>选择训练模式</Text>
      <View className={styles.breathingModes}>
        {breathingModes.map(mode => (
          <View
            key={mode.type}
            className={classnames(styles.modeCard, selectedMode === mode.type && styles.selected)}
            onClick={() => setSelectedMode(mode.type)}
          >
            <View
              className={styles.modeIcon}
              style={{ backgroundColor: `${mode.color}15` }}
            >
              <Text>{mode.icon}</Text>
            </View>
            <Text className={styles.modeName}>{mode.name}</Text>
            <Text className={styles.modeDesc}>{mode.desc}</Text>
          </View>
        ))}
      </View>

      <Text className={styles.sectionTitle}>训练时长</Text>
      <View className={styles.durationSelector}>
        {durations.map(dur => (
          <View
            key={dur}
            className={classnames(styles.durationBtn, selectedDuration === dur && styles.active)}
            onClick={() => setSelectedDuration(dur)}
          >
            <Text>{dur}分钟</Text>
          </View>
        ))}
      </View>

      <View className={styles.startBtn} onClick={startBreathing}>
        <Text>开始训练</Text>
      </View>

      <Text className={styles.sectionTitle}>提醒设置</Text>
      <View className={styles.settingsCard}>
        <View className={styles.settingRow}>
          <View className={styles.settingInfo}>
            <Text className={styles.settingName}>久坐提醒</Text>
            <Text className={styles.settingDesc}>每小时提醒起身活动</Text>
          </View>
          <Switch
            checked={sedentaryReminder?.enabled || false}
            color="#22C55E"
            onChange={() => {
              if (sedentaryReminder) {
                console.log('[Training] 切换久坐提醒');
                toggleReminder(sedentaryReminder.id);
              }
            }}
          />
        </View>
      </View>

      <Text className={styles.sectionTitle}>最近训练</Text>
      <View className={styles.historyList}>
        {breathingSessions.length === 0 ? (
          <View className={styles.settingRow}>
            <Text className={styles.settingDesc} style={{ textAlign: 'center', width: '100%' }}>
              暂无训练记录，开始你的第一次训练吧
            </Text>
          </View>
        ) : (
          breathingSessions.slice(-5).reverse().map(session => {
            const mode = breathingModes.find(m => m.type === session.type);
            return (
              <View key={session.id} className={styles.historyItem}>
                <View
                  className={styles.historyIcon}
                  style={{ backgroundColor: `${mode?.color || '#22C55E'}15` }}
                >
                  <Text>{mode?.icon || '🧘'}</Text>
                </View>
                <View className={styles.historyContent}>
                  <Text className={styles.historyType}>{mode?.name || '呼吸训练'}</Text>
                  <Text className={styles.historyTime}>
                    {dayjs(session.date).format('MM月DD日 HH:mm')}
                  </Text>
                </View>
                <Text className={styles.historyDuration}>{session.duration}分钟</Text>
              </View>
            );
          })
        )}
      </View>

      {isBreathing && (
        <View className={styles.breathingOverlay}>
          <View className={styles.closeBtn} onClick={stopBreathing}>
            <Text>×</Text>
          </View>
          
          <Text className={styles.breathingTitle}>{currentMode?.name}</Text>
          
          <View className={styles.breathingCircle}>
            <View className={styles.circleOuter} />
            <View className={classnames(styles.circleInner, styles[breathingPhase])}>
              <Text className={styles.circleText}>{formatTime(timeLeft)}</Text>
            </View>
          </View>
          
          <Text className={styles.breathingPhase}>{phaseText}</Text>
          <Text className={styles.breathingTimer}>剩余 {formatTime(timeLeft)}</Text>
          
          <Text className={styles.breathingInstruction}>
            跟随圆圈的节奏呼吸{'\n'}
            吸气时圆圈扩大，呼气时缩小
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default TrainingPage;
