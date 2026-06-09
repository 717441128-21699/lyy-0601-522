import React, { useState, useEffect } from 'react';
import { View, Text, Slider, Textarea, Switch, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useHealthStore } from '@/store/useHealthStore';
import MoodSelector from '@/components/MoodSelector';
import { getStressLevelText, getStressLevelColor, getMoodInfo, getSleepQualityText, getSleepQualityColor } from '@/utils/health';
import type { MoodType } from '@/types/health';

const RecordPage: React.FC = () => {
  const {
    todayRecord,
    dailyRecords,
    goals,
    loadTodayRecord,
    setTodayMood,
    setTodayStress,
    setTodayEnergy,
    setTodaySteps,
    setTodayExercise,
    setTodayCaffeine,
    setTodaySpecialNote,
    checkInToday,
    updateGoalProgress,
  } = useHealthStore();

  const [mood, setMood] = useState<MoodType>('normal');
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [steps, setSteps] = useState(0);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [caffeineCups, setCaffeineCups] = useState(0);
  const [isPeriodDay, setIsPeriodDay] = useState(false);
  const [specialNote, setSpecialNote] = useState('');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    loadTodayRecord();
    if (todayRecord) {
      setMood(todayRecord.mood);
      setStressLevel(todayRecord.stressLevel);
      setEnergyLevel(todayRecord.energyLevel);
      setSteps(todayRecord.steps || 0);
      setExerciseMinutes(todayRecord.exerciseMinutes || 0);
      setCaffeineCups(todayRecord.caffeineIntake);
      setIsPeriodDay(todayRecord.isPeriodDay || false);
      setSpecialNote(todayRecord.specialNote || '');
      setHasCheckedIn(!!todayRecord.checkInTime);
    }
  }, [todayRecord]);

  const handleMoodChange = (newMood: MoodType) => {
    console.log('[Record] 选择心情:', newMood);
    setMood(newMood);
    setTodayMood(newMood);
  };

  const handleStressChange = (value: number) => {
    setStressLevel(value);
    setTodayStress(value);
  };

  const handleEnergyChange = (value: number) => {
    setEnergyLevel(value);
    setTodayEnergy(value);
  };

  const handleStepsChange = (delta: number) => {
    const newValue = Math.max(0, steps + delta);
    console.log('[Record] 步数变更:', newValue);
    setSteps(newValue);
    setTodaySteps(newValue);
  };

  const handleQuickSteps = (value: number) => {
    console.log('[Record] 快速步数:', value);
    setSteps(value);
    setTodaySteps(value);
  };

  const handleExerciseChange = (delta: number) => {
    const newValue = Math.max(0, exerciseMinutes + delta);
    console.log('[Record] 运动时长变更:', newValue);
    setExerciseMinutes(newValue);
    setTodayExercise(newValue);
  };

  const handleQuickExercise = (value: number) => {
    console.log('[Record] 快速运动:', value);
    setExerciseMinutes(value);
    setTodayExercise(value);
  };

  const handleCaffeineChange = (delta: number) => {
    const newValue = Math.max(0, Math.min(10, caffeineCups + delta));
    console.log('[Record] 咖啡因变更:', newValue);
    setCaffeineCups(newValue);
    setTodayCaffeine(newValue);
  };

  const handlePeriodToggle = (value: boolean) => {
    console.log('[Record] 经期标记:', value);
    setIsPeriodDay(value);
    setTodaySpecialNote(specialNote, value);
  };

  const handleNoteChange = (value: string) => {
    setSpecialNote(value);
    setTodaySpecialNote(value, isPeriodDay);
  };

  const handleCheckIn = () => {
    console.log('[Record] 完成打卡');
    checkInToday();
    setHasCheckedIn(true);

    const stepsGoal = goals.find(g => g.type === 'steps');
    if (stepsGoal) {
      updateGoalProgress(stepsGoal.id, steps);
    }
    const exerciseGoal = goals.find(g => g.type === 'exercise');
    if (exerciseGoal) {
      updateGoalProgress(exerciseGoal.id, exerciseMinutes);
    }

    Taro.showToast({
      title: '打卡成功！',
      icon: 'success',
      duration: 2000,
    });
  };

  const recentRecords = dailyRecords.slice(-7).reverse();
  const caffeineMg = caffeineCups * 95;

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.dateText}>{dayjs().format('MM月DD日 dddd')}</Text>
        {hasCheckedIn && (
          <View className={styles.checkInStatus}>
            <Text>✅</Text>
            <Text className={styles.statusText}>已打卡</Text>
          </View>
        )}
      </View>

      <View className={classnames(styles.section, styles.moodSection)}>
        <Text className={styles.sectionTitle}>今日心情</Text>
        <MoodSelector value={mood} onChange={handleMoodChange} size="lg" />
      </View>

      <View className={styles.section}>
        <View className={styles.sliderSection}>
          <Text className={styles.sectionTitle}>压力水平</Text>
          <View className={styles.sliderHeader}>
            <Text className={styles.sliderValue} style={{ color: getStressLevelColor(stressLevel) }}>
              {stressLevel}
            </Text>
            <Text 
              className={styles.sliderLabel}
              style={{ 
                backgroundColor: `${getStressLevelColor(stressLevel)}15`,
                color: getStressLevelColor(stressLevel)
              }}
            >
              {getStressLevelText(stressLevel)}
            </Text>
          </View>
          <Slider
            className={styles.slider}
            min={1}
            max={10}
            step={1}
            value={stressLevel}
            activeColor={getStressLevelColor(stressLevel)}
            backgroundColor="#f0f0f0"
            blockSize={28}
            blockColor="#ffffff"
            onChange={(e) => handleStressChange(e.detail.value)}
          />
          <View className={styles.sliderIcons}>
            <Text>😌</Text>
            <Text>😰</Text>
          </View>
        </View>

        <View className={styles.sliderSection}>
          <Text className={styles.sectionTitle}>精力水平</Text>
          <View className={styles.sliderHeader}>
            <Text className={styles.sliderValue} style={{ color: getSleepQualityColor(energyLevel) }}>
              {energyLevel}
            </Text>
            <Text 
              className={styles.sliderLabel}
              style={{ 
                backgroundColor: `${getSleepQualityColor(energyLevel)}15`,
                color: getSleepQualityColor(energyLevel)
              }}
            >
              {getSleepQualityText(energyLevel)}
            </Text>
          </View>
          <Slider
            className={styles.slider}
            min={1}
            max={10}
            step={1}
            value={energyLevel}
            activeColor={getSleepQualityColor(energyLevel)}
            backgroundColor="#f0f0f0"
            blockSize={28}
            blockColor="#ffffff"
            onChange={(e) => handleEnergyChange(e.detail.value)}
          />
          <View className={styles.sliderIcons}>
            <Text>😫</Text>
            <Text>⚡</Text>
          </View>
        </View>
      </View>

      <View className={classnames(styles.section, styles.exerciseSection)}>
        <Text className={styles.sectionTitle}>今日运动</Text>
        <View className={styles.inputRow}>
          <View className={styles.inputLabel}>
            <Text className={styles.icon}>👟</Text>
            <Text>今日步数</Text>
          </View>
          <View className={styles.inputControls}>
            <View className={styles.inputBtn} onClick={() => handleStepsChange(-500)}>
              <Text>−</Text>
            </View>
            <View className={styles.inputValue}>
              {steps.toLocaleString()}
              <Text className={styles.unit}>步</Text>
            </View>
            <View className={styles.inputBtn} onClick={() => handleStepsChange(500)}>
              <Text>+</Text>
            </View>
          </View>
        </View>
        <View className={styles.quickBtns}>
          <View className={styles.quickBtn} onClick={() => handleQuickSteps(3000)}>
            <Text>3000步</Text>
          </View>
          <View className={styles.quickBtn} onClick={() => handleQuickSteps(5000)}>
            <Text>5000步</Text>
          </View>
          <View className={styles.quickBtn} onClick={() => handleQuickSteps(8000)}>
            <Text>8000步</Text>
          </View>
          <View className={styles.quickBtn} onClick={() => handleQuickSteps(10000)}>
            <Text>10000步</Text>
          </View>
        </View>
        <View className={styles.inputRow} style={{ marginTop: 32 }}>
          <View className={styles.inputLabel}>
            <Text className={styles.icon}>💪</Text>
            <Text>运动时长</Text>
          </View>
          <View className={styles.inputControls}>
            <View className={styles.inputBtn} onClick={() => handleExerciseChange(-10)}>
              <Text>−</Text>
            </View>
            <View className={styles.inputValue}>
              {exerciseMinutes}
              <Text className={styles.unit}>分钟</Text>
            </View>
            <View className={styles.inputBtn} onClick={() => handleExerciseChange(10)}>
              <Text>+</Text>
            </View>
          </View>
        </View>
        <View className={styles.quickBtns}>
          <View className={styles.quickBtn} onClick={() => handleQuickExercise(15)}>
            <Text>15分钟</Text>
          </View>
          <View className={styles.quickBtn} onClick={() => handleQuickExercise(30)}>
            <Text>30分钟</Text>
          </View>
          <View className={styles.quickBtn} onClick={() => handleQuickExercise(45)}>
            <Text>45分钟</Text>
          </View>
          <View className={styles.quickBtn} onClick={() => handleQuickExercise(60)}>
            <Text>60分钟</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>咖啡因摄入</Text>
        <View className={styles.caffeineSection}>
          <View className={styles.caffeineInfo}>
            <Text className={styles.caffeineIcon}>☕</Text>
            <View className={styles.caffeineText}>
              <Text className={styles.cups}>{caffeineCups} 杯</Text>
              <Text className={styles.mg}>约 {caffeineMg}mg 咖啡因</Text>
            </View>
          </View>
          <View className={styles.caffeineControls}>
            <View className={styles.controlBtn} onClick={() => handleCaffeineChange(-1)}>
              <Text>−</Text>
            </View>
            <Text className={styles.countText}>{caffeineCups}</Text>
            <View className={styles.controlBtn} onClick={() => handleCaffeineChange(1)}>
              <Text>+</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={classnames(styles.section, styles.specialSection)}>
        <Text className={styles.sectionTitle}>特殊状态</Text>
        <View className={styles.row}>
          <View className={styles.label}>
            <Text>🩸</Text>
            <Text>经期日</Text>
          </View>
          <Switch
            checked={isPeriodDay}
            color="#EC4899"
            onChange={(e) => handlePeriodToggle(e.detail.value)}
          />
        </View>
        <Textarea
          className={styles.noteInput}
          placeholder="添加特殊备注（如身体不适、用药等）..."
          value={specialNote}
          onInput={(e) => handleNoteChange(e.detail.value)}
          maxlength={200}
          autoHeight
        />
      </View>

      <View className={classnames(styles.section, styles.historySection)}>
        <Text className={styles.historyTitle}>最近记录</Text>
        <View className={styles.timeline}>
          {recentRecords.map((record, index) => {
            const moodInfo = getMoodInfo(record.mood);
            return (
              <View key={record.id} className={styles.timelineItem}>
                <View className={styles.itemHeader}>
                  <Text className={styles.itemDate}>
                    {index === 0 ? '今天' : dayjs(record.date).format('MM月DD日')}
                  </Text>
                  <Text className={styles.itemMood}>{moodInfo.emoji}</Text>
                </View>
                <View className={styles.itemStats}>
                  <Text className={styles.statItem}>压力 {record.stressLevel}</Text>
                  <Text className={styles.statItem}>😴 {record.sleepHours}h</Text>
                  <Text className={styles.statItem}>💪 {record.exerciseMinutes}m</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.checkInBtn, hasCheckedIn && styles.disabled)}
          onClick={!hasCheckedIn ? handleCheckIn : undefined}
        >
          <Text>{hasCheckedIn ? '今日已打卡' : '完成今日打卡'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default RecordPage;
