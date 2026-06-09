import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, PullDownRefresh } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import { useHealthStore } from '@/store/useHealthStore';
import StatCard from '@/components/StatCard';
import ProgressRing from '@/components/ProgressRing';
import { getMoodInfo, getReminderTypeIcon, calculateBMI } from '@/utils/health';

const HomePage: React.FC = () => {
  const {
    todayRecord,
    dailyRecords,
    goals,
    reminders,
    userProfile,
    loadTodayRecord,
    setTodaySteps,
    toggleReminder,
  } = useHealthStore();

  const [greeting, setGreeting] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadTodayRecord();
    updateGreeting();
  }, []);

  const updateGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 6) setGreeting('夜深了');
    else if (hour < 9) setGreeting('早上好');
    else if (hour < 12) setGreeting('上午好');
    else if (hour < 14) setGreeting('中午好');
    else if (hour < 18) setGreeting('下午好');
    else if (hour < 22) setGreeting('晚上好');
    else setGreeting('夜深了');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTodayRecord();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleQuickRecord = () => {
    Taro.switchTab({ url: '/pages/record/index' });
  };

  const handleEntryClick = (type: string) => {
    console.log('[Home] 点击功能入口:', type);
    switch (type) {
      case 'breathing':
        Taro.switchTab({ url: '/pages/training/index' });
        break;
      case 'sleep':
        Taro.navigateTo({ url: '/pages/sleep/index' });
        break;
      case 'report':
        Taro.navigateTo({ url: '/pages/report/index' });
        break;
      case 'water':
        const newWater = (todayRecord?.waterIntake || 0) + 250;
        setTodaySteps(newWater);
        Taro.showToast({ title: '已记录 +250ml', icon: 'success' });
        break;
      default:
        break;
    }
  };

  const todaySteps = todayRecord?.steps || 5234;
  const stepsGoal = goals.find(g => g.type === 'steps')?.target || 8000;
  const exerciseToday = todayRecord?.exerciseMinutes || 0;
  const sleepToday = todayRecord?.sleepHours || 6.5;
  const waterToday = todayRecord?.waterIntake || 1200;
  const moodInfo = getMoodInfo(todayRecord?.mood || 'normal');

  const quickEntries = [
    { id: 'breathing', icon: '🧘', text: '呼吸训练', color: '#8B5CF6' },
    { id: 'sleep', icon: '😴', text: '睡眠记录', color: '#06B6D4' },
    { id: 'water', icon: '💧', text: '快速喝水', color: '#3B82F6' },
    { id: 'report', icon: '📊', text: '健康报告', color: '#F59E0B' },
  ];

  const enabledReminders = reminders.filter(r => r.enabled).slice(0, 3);

  return (
    <PullDownRefresh onRefresh={handleRefresh} refreshing={isRefreshing}>
      <ScrollView scrollY className={styles.page}>
        <View className={styles.header}>
          <View className={styles.greetingRow}>
            <View className={styles.greeting}>
              <Text className={styles.greetingText}>{greeting}，{userProfile.name}</Text>
              <Text className={styles.dateText}>{dayjs().format('YYYY年MM月DD日 dddd')}</Text>
            </View>
            <View className={styles.todayMood}>
              <Text className={styles.moodEmoji}>{moodInfo.emoji}</Text>
              <Text className={styles.moodLabel}>{moodInfo.label}</Text>
            </View>
          </View>
        </View>

        <View className={styles.stepsCard}>
          <View className={styles.progressWrap}>
            <ProgressRing
              progress={todaySteps}
              target={stepsGoal}
              size={180}
              strokeWidth={14}
              color="#22C55E"
            />
          </View>
          <View className={styles.stepsInfo}>
            <Text className={styles.stepsValue}>{todaySteps.toLocaleString()}</Text>
            <Text className={styles.stepsTarget}>目标 {stepsGoal.toLocaleString()} 步</Text>
            <Text className={styles.stepsTip}>
              {todaySteps >= stepsGoal ? '🎉 目标已完成！' : `还差 ${(stepsGoal - todaySteps).toLocaleString()} 步`}
            </Text>
            <View className={styles.quickRecordBtn} onClick={handleQuickRecord}>
              <Text>快捷记录 +</Text>
            </View>
          </View>
        </View>

        <View className={styles.statsGrid}>
          <StatCard
            icon="💪"
            value={`${exerciseToday}分钟`}
            label="今日运动"
            color="#06B6D4"
            trend={12}
          />
          <StatCard
            icon="😴"
            value={`${sleepToday}小时`}
            label="昨晚睡眠"
            color="#8B5CF6"
            trend={-5}
          />
          <StatCard
            icon="💧"
            value={`${waterToday}ml`}
            label="今日饮水"
            color="#3B82F6"
          />
          <StatCard
            icon="⚖️"
            value={calculateBMI(userProfile.weight, userProfile.height)}
            label="BMI 指数"
            color="#F59E0B"
          />
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>快捷功能</Text>
        </View>

        <ScrollView scrollX className={styles.quickEntries} enhanced showScrollbar={false}>
          {quickEntries.map(entry => (
            <View
              key={entry.id}
              className={styles.entryItem}
              onClick={() => handleEntryClick(entry.id)}
            >
              <View
                className={styles.entryIcon}
                style={{ backgroundColor: `${entry.color}15` }}
              >
                <Text>{entry.icon}</Text>
              </View>
              <Text className={styles.entryText}>{entry.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>今日提醒</Text>
          <Text className={styles.sectionMore} onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}>管理</Text>
        </View>

        <View className={styles.reminderList}>
          {enabledReminders.map(reminder => (
            <View key={reminder.id} className={styles.reminderItem}>
              <View className={styles.reminderIcon}>
                <Text>{getReminderTypeIcon(reminder.type)}</Text>
              </View>
              <View className={styles.reminderContent}>
                <Text className={styles.reminderTitle}>{reminder.title}</Text>
                <Text className={styles.reminderTime}>{reminder.time}</Text>
              </View>
              <Switch
                className={styles.switch}
                checked={reminder.enabled}
                color="#22C55E"
                onChange={() => {
                  console.log('[Home] 切换提醒:', reminder.id);
                  toggleReminder(reminder.id);
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </PullDownRefresh>
  );
};

export default HomePage;
