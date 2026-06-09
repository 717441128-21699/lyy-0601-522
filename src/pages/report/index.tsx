import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import { useHealthStore } from '@/store/useHealthStore';
import { calculateWeeklyReport, getStressLevelColor, formatTime } from '@/utils/health';
import type { HealthReport, DailyRecord } from '@/types/health';

const ReportPage: React.FC = () => {
  const { dailyRecords, todayRecord, goals, loadTodayRecord } = useHealthStore();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadTodayRecord();
  }, [loadTodayRecord]);

  const waterGoal = goals.find(g => g.type === 'water');
  const todayWater = todayRecord?.waterIntake || 0;
  const waterProgress = waterGoal ? Math.min((todayWater / waterGoal.target) * 100, 100) : 0;

  const calculateMonthlyReport = (records: DailyRecord[]): HealthReport => {
    const monthRecords = records.slice(-30);
    const validRecords = monthRecords.filter(r => r.steps > 0 || r.sleepHours > 0 || r.waterIntake > 0);

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
      ? Number((validRecords.reduce((sum, r) => sum + (
        r.mood === 'great' ? 5 : r.mood === 'good' ? 4 : r.mood === 'normal' ? 3 : r.mood === 'bad' ? 2 : 1
      ), 0) / validRecords.length).toFixed(1))
      : 0;

    const avgWater = validRecords.length > 0
      ? Math.round(validRecords.reduce((sum, r) => sum + (r.waterIntake || 0), 0) / validRecords.length)
      : 0;

    const exerciseDays = monthRecords.filter(r => r.exerciseMinutes > 0).length;
    const totalExerciseMinutes = monthRecords.reduce((sum, r) => sum + r.exerciseMinutes, 0);

    const suggestions: string[] = [];

    if (avgSteps < 6000) {
      suggestions.push('本月平均步数偏低，建议利用通勤和午休时间多走动。');
    }
    if (avgSleep < 7) {
      suggestions.push('睡眠时长不足，建议设定固定作息，睡前减少使用电子设备。');
    }
    if (avgStress > 6) {
      suggestions.push('长期压力偏高，建议每天安排10分钟呼吸训练时间。');
    }
    if (avgWater < 1500) {
      suggestions.push('月均饮水量不足，建议养成定时喝水的好习惯。');
    }
    if (exerciseDays < 8) {
      suggestions.push('本月运动天数不足，建议每周至少运动2-3次，保持规律。');
    }
    if (avgMood < 3) {
      suggestions.push('整体情绪偏低，可以尝试培养一个小爱好来调节心情。');
    }
    if (suggestions.length === 0) {
      suggestions.push('本月表现优秀！继续保持良好的生活习惯，关注身心健康。');
    }

    return {
      period: 'month',
      startDate: monthRecords[0]?.date || dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
      endDate: monthRecords[monthRecords.length - 1]?.date || dayjs().format('YYYY-MM-DD'),
      avgSteps,
      avgSleep,
      avgStress,
      avgMood,
      avgWater,
      exerciseDays,
      totalExerciseMinutes,
      suggestions,
    };
  };

  const report = useMemo(() => {
    return period === 'week'
      ? calculateWeeklyReport(dailyRecords)
      : calculateMonthlyReport(dailyRecords);
  }, [period, dailyRecords]);

  const prevReport = useMemo(() => {
    const offset = period === 'week' ? 7 : 30;
    const prevRecords = dailyRecords.slice(-offset * 2, -offset);
    return period === 'week'
      ? calculateWeeklyReport(prevRecords.length > 0 ? prevRecords : dailyRecords.slice(0, 7))
      : calculateMonthlyReport(prevRecords.length > 0 ? prevRecords : dailyRecords.slice(0, 30));
  }, [period, dailyRecords]);

  const healthScore = useMemo(() => {
    const stepsScore = Math.min((report.avgSteps / 10000) * 20, 20);
    const sleepScore = Math.min((report.avgSleep / 8) * 20, 20);
    const stressScore = Math.max(0, 20 - (report.avgStress - 5) * 4);
    const moodScore = (report.avgMood / 5) * 20;
    const waterScore = Math.min((report.avgWater / 2000) * 20, 20);
    return Math.round(stepsScore + sleepScore + stressScore + moodScore + waterScore);
  }, [report]);

  const prevHealthScore = useMemo(() => {
    const stepsScore = Math.min((prevReport.avgSteps / 10000) * 20, 20);
    const sleepScore = Math.min((prevReport.avgSleep / 8) * 20, 20);
    const stressScore = Math.max(0, 20 - (prevReport.avgStress - 5) * 4);
    const moodScore = (prevReport.avgMood / 5) * 20;
    const waterScore = Math.min((prevReport.avgWater / 2000) * 20, 20);
    return Math.round(stepsScore + sleepScore + stressScore + moodScore + waterScore);
  }, [prevReport]);

  const scoreDiff = healthScore - prevHealthScore;

  const chartData = useMemo(() => {
    const days = period === 'week' ? 7 : 30;
    const step = period === 'week' ? 1 : 5;
    const data: { label: string; steps: number; sleep: number; stress: number; water: number }[] = [];
    const records = dailyRecords.slice(-days);

    for (let i = 0; i < records.length; i += step) {
      const group = records.slice(i, i + step);
      const avgSteps = Math.round(group.reduce((s, r) => s + r.steps, 0) / group.length);
      const avgSleep = Number((group.reduce((s, r) => s + r.sleepHours, 0) / group.length).toFixed(1));
      const avgStress = Number((group.reduce((s, r) => s + r.stressLevel, 0) / group.length).toFixed(1));
      const avgWater = Math.round(group.reduce((s, r) => s + (r.waterIntake || 0), 0) / group.length);
      data.push({
        label: period === 'week'
          ? dayjs(group[0].date).format('ddd')
          : dayjs(group[0].date).format('MM/DD'),
        steps: avgSteps,
        sleep: avgSleep,
        stress: avgStress,
        water: avgWater,
      });
    }
    return data;
  }, [period, dailyRecords]);

  const getTrendIcon = (current: number, prev: number, higherIsBetter: boolean = true) => {
    const diff = current - prev;
    if (Math.abs(diff) < 0.1) return { icon: '➖', class: '' };
    const isUp = diff > 0;
    const isGood = higherIsBetter ? isUp : !isUp;
    return {
      icon: isUp ? '↑' : '↓',
      class: isGood ? 'up' : 'down',
      text: `${Math.abs(diff).toFixed(1)}`,
    };
  };

  const getMoodText = (score: number) => {
    if (score >= 4.5) return '很棒';
    if (score >= 3.5) return '不错';
    if (score >= 2.5) return '一般';
    if (score >= 1.5) return '不好';
    return '很差';
  };

  const getSummary = () => {
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (report.avgSteps >= 8000) strengths.push('每日步数达标');
    else improvements.push('增加日常活动量');

    if (report.avgSleep >= 7) strengths.push('睡眠充足规律');
    else improvements.push('调整作息时间');

    if (report.avgStress <= 5) strengths.push('压力管理良好');
    else improvements.push('学习放松技巧');

    if (report.avgWater >= 1500) strengths.push('饮水量充足');
    else improvements.push('增加饮水量');

    if (report.exerciseDays >= (period === 'week' ? 3 : 10)) strengths.push('运动习惯稳定');
    else improvements.push('保持规律运动');

    return { strengths, improvements };
  };

  const summary = getSummary();

  const maxSteps = Math.max(...chartData.map(d => d.steps), 10000);
  const maxSleep = Math.max(...chartData.map(d => d.sleep), 10);
  const maxStress = Math.max(...chartData.map(d => d.stress), 10);
  const maxWater = Math.max(...chartData.map(d => d.water), 2000);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.tabBar}>
        <View
          className={`${styles.tabItem} ${period === 'week' ? styles.active : ''}`}
          onClick={() => setPeriod('week')}
        >
          <Text className={styles.tabText}>周报</Text>
        </View>
        <View
          className={`${styles.tabItem} ${period === 'month' ? styles.active : ''}`}
          onClick={() => setPeriod('month')}
        >
          <Text className={styles.tabText}>月报</Text>
        </View>
      </View>

      <View className={styles.overviewCard}>
        <View className={styles.overviewHeader}>
          <Text className={styles.overviewTitle}>健康总评</Text>
          <Text className={styles.overviewDate}>
            {dayjs(report.startDate).format('MM/DD')} - {dayjs(report.endDate).format('MM/DD')}
          </Text>
        </View>
        <View className={styles.healthScore}>
          <Text className={styles.scoreValue}>{healthScore}</Text>
          <Text className={styles.scoreLabel}>健康指数</Text>
          <View className={styles.scoreCompare}>
            <Text className={scoreDiff >= 0 ? styles.scoreUp : styles.scoreDown}>
              {scoreDiff >= 0 ? '↑' : '↓'} {Math.abs(scoreDiff)} 分 vs 上{period === 'week' ? '周' : '月'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.waterProgressCard}>
        <View className={styles.waterHeader}>
          <View className={styles.waterInfo}>
            <Text className={styles.waterIcon}>💧</Text>
            <View>
              <Text className={styles.waterTitle}>今日饮水</Text>
              <Text className={styles.waterProgress}>
                {todayWater.toLocaleString()} / {waterGoal?.target.toLocaleString() || 2000} ml
              </Text>
            </View>
          </View>
          <Text className={styles.waterPercent}>{Math.round(waterProgress)}%</Text>
        </View>
        <View className={styles.waterProgressBar}>
          <View className={styles.waterProgressFill} style={{ width: `${waterProgress}%` }} />
        </View>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <View className={styles.statHeader}>
            <Text className={styles.statIcon}>👟</Text>
            <Text className={`${styles.statTrend} ${getTrendIcon(report.avgSteps, prevReport.avgSteps).class}`}>
              {getTrendIcon(report.avgSteps, prevReport.avgSteps).icon} {getTrendIcon(report.avgSteps, prevReport.avgSteps).text}
            </Text>
          </View>
          <Text className={styles.statValue}>
            {report.avgSteps.toLocaleString()}
            <Text className={styles.statUnit}> 步</Text>
          </Text>
          <Text className={styles.statLabel}>平均步数</Text>
        </View>

        <View className={styles.statCard}>
          <View className={styles.statHeader}>
            <Text className={styles.statIcon}>😴</Text>
            <Text className={`${styles.statTrend} ${getTrendIcon(report.avgSleep, prevReport.avgSleep).class}`}>
              {getTrendIcon(report.avgSleep, prevReport.avgSleep).icon} {getTrendIcon(report.avgSleep, prevReport.avgSleep).text}
            </Text>
          </View>
          <Text className={styles.statValue}>
            {report.avgSleep}
            <Text className={styles.statUnit}> 小时</Text>
          </Text>
          <Text className={styles.statLabel}>平均睡眠</Text>
        </View>

        <View className={styles.statCard}>
          <View className={styles.statHeader}>
            <Text className={styles.statIcon}>🧠</Text>
            <Text className={`${styles.statTrend} ${getTrendIcon(report.avgStress, prevReport.avgStress, false).class}`}>
              {getTrendIcon(report.avgStress, prevReport.avgStress, false).icon} {getTrendIcon(report.avgStress, prevReport.avgStress, false).text}
            </Text>
          </View>
          <Text className={styles.statValue} style={{ color: getStressLevelColor(report.avgStress) }}>
            {report.avgStress}
            <Text className={styles.statUnit}> /10</Text>
          </Text>
          <Text className={styles.statLabel}>压力水平</Text>
        </View>

        <View className={styles.statCard}>
          <View className={styles.statHeader}>
            <Text className={styles.statIcon}>😊</Text>
            <Text className={`${styles.statTrend} ${getTrendIcon(report.avgMood, prevReport.avgMood).class}`}>
              {getTrendIcon(report.avgMood, prevReport.avgMood).icon} {getTrendIcon(report.avgMood, prevReport.avgMood).text}
            </Text>
          </View>
          <Text className={styles.statValue}>
            {getMoodText(report.avgMood)}
          </Text>
          <Text className={styles.statLabel}>心情指数 {report.avgMood.toFixed(1)}/5</Text>
        </View>

        <View className={styles.statCard}>
          <View className={styles.statHeader}>
            <Text className={styles.statIcon}>💧</Text>
            <Text className={`${styles.statTrend} ${getTrendIcon(report.avgWater, prevReport.avgWater).class}`}>
              {getTrendIcon(report.avgWater, prevReport.avgWater).icon} {getTrendIcon(report.avgWater, prevReport.avgWater).text}
            </Text>
          </View>
          <Text className={styles.statValue}>
            {report.avgWater.toLocaleString()}
            <Text className={styles.statUnit}> ml</Text>
          </Text>
          <Text className={styles.statLabel}>平均饮水</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>
        <Text className={styles.sectionIcon}>📊</Text>
        趋势对比
      </Text>

      <View className={styles.chartSection}>
        <Text className={styles.chartTitle}>核心指标趋势</Text>
        <View className={styles.chartLegend}>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#22C55E' }} />
            <Text className={styles.legendText}>步数</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#8B5CF6' }} />
            <Text className={styles.legendText}>睡眠</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#F59E0B' }} />
            <Text className={styles.legendText}>压力</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#06B6D4' }} />
            <Text className={styles.legendText}>饮水</Text>
          </View>
        </View>

        <View className={styles.barChart}>
          {chartData.map((item, index) => (
            <View key={index} className={styles.barGroup}>
              <View>
                <View
                  className={`${styles.barItem} steps`}
                  style={{ height: `${(item.steps / maxSteps) * 100}%` }}
                />
              </View>
              <View>
                <View
                  className={`${styles.barItem} sleep`}
                  style={{ height: `${(item.sleep / maxSleep) * 100}%` }}
                />
              </View>
              <View>
                <View
                  className={`${styles.barItem} stress`}
                  style={{ height: `${(item.stress / maxStress) * 100}%` }}
                />
              </View>
              <View>
                <View
                  className={`${styles.barItem} water`}
                  style={{ height: `${(item.water / maxWater) * 100}%` }}
                />
              </View>
            </View>
          ))}
        </View>

        <View className={styles.chartLabels}>
          {chartData.map((item, index) => (
            <Text key={index} className={styles.chartLabel}>{item.label}</Text>
          ))}
        </View>
      </View>

      <Text className={styles.sectionTitle}>
        <Text className={styles.sectionIcon}>💪</Text>
        运动统计
      </Text>

      <View className={styles.exerciseStats}>
        <View className={styles.exerciseItem}>
          <Text className={styles.exerciseIcon}>📅</Text>
          <Text className={styles.exerciseValue}>
            {report.exerciseDays}
            <Text className={styles.exerciseUnit}>天</Text>
          </Text>
          <Text className={styles.exerciseLabel}>运动天数</Text>
        </View>
        <View className={styles.exerciseItem}>
          <Text className={styles.exerciseIcon}>⏱️</Text>
          <Text className={styles.exerciseValue}>
            {Math.floor(report.totalExerciseMinutes / 60)}
            <Text className={styles.exerciseUnit}>小时</Text>
          </Text>
          <Text className={styles.exerciseLabel}>总运动时长</Text>
        </View>
        <View className={styles.exerciseItem}>
          <Text className={styles.exerciseIcon}>🔥</Text>
          <Text className={styles.exerciseValue}>
            {report.totalExerciseMinutes > 0 ? Math.round(report.totalExerciseMinutes * 8) : 0}
            <Text className={styles.exerciseUnit}>千卡</Text>
          </Text>
          <Text className={styles.exerciseLabel}>消耗热量</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>
        <Text className={styles.sectionIcon}>💡</Text>
        健康建议
      </Text>

      <View className={styles.suggestionSection}>
        <View className={styles.suggestionList}>
          {report.suggestions.map((suggestion, index) => (
            <View key={index} className={styles.suggestionItem}>
              <Text className={styles.suggestionIcon}>
                {index === 0 ? '🎯' : index === 1 ? '💪' : index === 2 ? '🧘' : '✨'}
              </Text>
              <Text className={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.summaryCard}>
        <View className={styles.summaryTitle}>
          <Text>📝</Text>
          <Text>本{period === 'week' ? '周' : '月'}总结</Text>
        </View>
        <View className={styles.summaryContent}>
          {summary.strengths.length > 0 && (
            <Text>✅ 做得好的方面：{summary.strengths.join('、')}。{'\n'}</Text>
          )}
          {summary.improvements.length > 0 && (
            <Text>🎯 需要改进：{summary.improvements.join('、')}。{'\n'}</Text>
          )}
          <Text>💪 继续关注健康，每天进步一点点！</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ReportPage;
