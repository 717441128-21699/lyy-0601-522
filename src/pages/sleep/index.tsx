import React, { useState, useEffect } from 'react';
import { View, Text, Slider, Switch, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import { useHealthStore } from '@/store/useHealthStore';
import { getSleepQualityText, getSleepQualityColor } from '@/utils/health';

const SleepPage: React.FC = () => {
  const {
    todayRecord,
    dailyRecords,
    reminders,
    goals,
    loadTodayRecord,
    setTodaySleep,
    toggleReminder,
    updateReminder,
    updateGoalProgress,
  } = useHealthStore();

  const [sleepHours, setSleepHours] = useState(6.5);
  const [sleepQuality, setSleepQuality] = useState(6);
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');

  useEffect(() => {
    loadTodayRecord();
    if (todayRecord) {
      setSleepHours(todayRecord.sleepHours || 6.5);
      setSleepQuality(todayRecord.sleepQuality || 6);
    }
    const sleepReminder = reminders.find(r => r.type === 'sleep');
    const wakeReminder = reminders.find(r => r.type === 'wakeup');
    if (sleepReminder) {
      setBedTime(sleepReminder.time);
    }
    if (wakeReminder) {
      setWakeTime(wakeReminder.time);
    }
  }, [todayRecord, reminders]);

  const handleSave = () => {
    console.log('[Sleep] 保存睡眠记录:', { sleepHours, sleepQuality, bedTime, wakeTime });
    setTodaySleep(sleepHours, sleepQuality);

    const sleepReminder = reminders.find(r => r.type === 'sleep');
    const wakeReminder = reminders.find(r => r.type === 'wakeup');
    if (sleepReminder) {
      updateReminder(sleepReminder.id, { time: bedTime });
    }
    if (wakeReminder) {
      updateReminder(wakeReminder.id, { time: wakeTime });
    }

    const sleepGoal = goals.find(g => g.type === 'sleep');
    if (sleepGoal) {
      updateGoalProgress(sleepGoal.id, sleepHours);
    }

    Taro.showToast({
      title: '睡眠记录已保存',
      icon: 'success',
    });
  };

  const calculateSleepHours = (bed: string, wake: string) => {
    const [bedH, bedM] = bed.split(':').map(Number);
    const [wakeH, wakeM] = wake.split(':').map(Number);
    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    const diffMinutes = wakeMinutes - bedMinutes;
    return Number((diffMinutes / 60).toFixed(1));
  };

  const handleBedTimeChange = (e: any) => {
    const newBedTime = e.detail.value;
    setBedTime(newBedTime);
    setSleepHours(calculateSleepHours(newBedTime, wakeTime));
  };

  const handleWakeTimeChange = (e: any) => {
    const newWakeTime = e.detail.value;
    setWakeTime(newWakeTime);
    setSleepHours(calculateSleepHours(bedTime, newWakeTime));
  };

  const sleepReminder = reminders.find(r => r.type === 'sleep');
  const wakeReminder = reminders.find(r => r.type === 'wakeup');

  const weekData = dailyRecords.slice(-7);
  const avgSleep = weekData.length > 0
    ? (weekData.reduce((sum, r) => sum + r.sleepHours, 0) / weekData.length).toFixed(1)
    : '0';
  const qualityColor = getSleepQualityColor(sleepQuality);
  const qualityText = getSleepQualityText(sleepQuality);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.sleepCard}>
        <View className={styles.sleepIcon}>
          <Text>😴</Text>
        </View>
        <View className={styles.sleepInfo}>
          <Text className={styles.sleepValue}>{sleepHours} 小时</Text>
          <Text className={styles.sleepLabel}>昨晚睡眠时长</Text>
          <View className={styles.sleepQuality}>
            <View className={styles.qualityDot} style={{ backgroundColor: qualityColor }} />
            <Text className={styles.qualityText} style={{ color: qualityColor }}>
              {qualityText}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>📊</Text>
          <Text className={styles.statValue}>{avgSleep}h</Text>
          <Text className={styles.statLabel}>近7天平均</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>🎯</Text>
          <Text className={styles.statValue}>8h</Text>
          <Text className={styles.statLabel}>每日目标</Text>
        </View>
      </View>

      <View className={styles.sectionTitle}>本周睡眠趋势</View>
      <View className={styles.weekChart}>
        <Text className={styles.chartTitle}>每日睡眠时长</Text>
        <View className={styles.chartBars}>
          {weekData.map((record, index) => {
            const height = Math.min((record.sleepHours / 10) * 100, 100);
            return (
              <View key={record.id} className={styles.chartBar}>
                <Text className={styles.barValue}>{record.sleepHours}h</Text>
                <View className={styles.barFill} style={{ height: `${height}%` }} />
                <Text className={styles.barLabel}>
                  {dayjs(record.date).format('MM/DD')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.sectionTitle}>记录今日睡眠</View>
      <View className={styles.recordSection}>
        <View className={styles.recordRow}>
          <Text className={styles.recordLabel}>入睡时间</Text>
          <View className={styles.recordValue}>
            <Picker mode="time" value={bedTime} onChange={handleBedTimeChange}>
              <View className={styles.timeBtn}>
                <Text>{bedTime}</Text>
              </View>
            </Picker>
          </View>
        </View>

        <View className={styles.recordRow}>
          <Text className={styles.recordLabel}>起床时间</Text>
          <View className={styles.recordValue}>
            <Picker mode="time" value={wakeTime} onChange={handleWakeTimeChange}>
              <View className={styles.timeBtn}>
                <Text>{wakeTime}</Text>
              </View>
            </Picker>
          </View>
        </View>

        <View className={styles.recordRow}>
          <Text className={styles.recordLabel}>睡眠时长</Text>
          <View className={styles.recordValue}>
            <Text className={styles.timeDisplay}>{sleepHours} 小时</Text>
          </View>
        </View>

        <View className={styles.recordRow} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Text className={styles.recordLabel}>睡眠质量</Text>
          <Slider
            className={styles.qualitySlider}
            min={1}
            max={10}
            step={1}
            value={sleepQuality}
            activeColor={qualityColor}
            backgroundColor="#f0f0f0"
            blockSize={28}
            blockColor="#ffffff"
            onChange={(e) => setSleepQuality(e.detail.value)}
          />
          <View className={styles.qualityLabels}>
            <Text>很差</Text>
            <Text>一般</Text>
            <Text>良好</Text>
            <Text>优秀</Text>
            <Text>完美</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionTitle}>睡眠提醒</View>
      <View className={styles.reminderSection}>
        <View className={styles.reminderRow}>
          <View className={styles.reminderInfo}>
            <View className={styles.reminderIcon}>
              <Text>🌙</Text>
            </View>
            <View className={styles.reminderContent}>
              <Text className={styles.title}>入睡提醒</Text>
              <Text className={styles.time}>{sleepReminder?.time || '22:30'} · 每天</Text>
            </View>
          </View>
          <Switch
            checked={sleepReminder?.enabled || false}
            color="#8B5CF6"
            onChange={() => {
              if (sleepReminder) {
                console.log('[Sleep] 切换入睡提醒');
                toggleReminder(sleepReminder.id);
              }
            }}
          />
        </View>

        <View className={styles.reminderRow}>
          <View className={styles.reminderInfo}>
            <View className={styles.reminderIcon}>
              <Text>☀️</Text>
            </View>
            <View className={styles.reminderContent}>
              <Text className={styles.title}>起床提醒</Text>
              <Text className={styles.time}>{wakeReminder?.time || '07:00'} · 工作日</Text>
            </View>
          </View>
          <Switch
            checked={wakeReminder?.enabled || false}
            color="#8B5CF6"
            onChange={() => {
              if (wakeReminder) {
                console.log('[Sleep] 切换起床提醒');
                toggleReminder(wakeReminder.id);
              }
            }}
          />
        </View>
      </View>

      <View className={styles.sectionTitle}>最近记录</View>
      <View className={styles.historyList}>
        {weekData.slice().reverse().map((record, index) => {
          const color = getSleepQualityColor(record.sleepQuality);
          return (
            <View key={record.id} className={styles.historyItem}>
              <View className={styles.historyDate}>
                <Text className={styles.day}>{dayjs(record.date).format('DD')}</Text>
                <Text className={styles.weekday}>
                  {index === 0 ? '今天' : dayjs(record.date).format('ddd')}
                </Text>
              </View>
              <View className={styles.historyContent}>
                <Text className={styles.historyDuration}>{record.sleepHours} 小时</Text>
                <View className={styles.historyQuality}>
                  <View className={styles.dot} style={{ backgroundColor: color }} />
                  <Text className={styles.text}>{getSleepQualityText(record.sleepQuality)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View className={styles.saveBtn} onClick={handleSave}>
        <Text>保存睡眠记录</Text>
      </View>
    </ScrollView>
  );
};

export default SleepPage;
