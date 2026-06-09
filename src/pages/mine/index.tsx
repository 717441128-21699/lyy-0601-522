import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useHealthStore } from '@/store/useHealthStore';
import BadgeItem from '@/components/BadgeItem';
import { calculateBMI, getBMILevel, getReminderTypeIcon, getRepeatText } from '@/utils/health';
import type { DailyRecord } from '@/types/health';

const MinePage: React.FC = () => {
  const {
    userProfile,
    badges,
    reminders,
    dailyRecords,
    privacySettings,
    updatePrivacySettings,
    toggleReminder,
    correctRecord,
    updateUserProfile,
  } = useHealthStore();

  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [correctedData, setCorrectedData] = useState({
    steps: '',
    exerciseMinutes: '',
    sleepHours: '',
    waterIntake: '',
  });

  const bmi = calculateBMI(userProfile.weight, userProfile.height);
  const bmiInfo = getBMILevel(bmi);
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const recentRecords = dailyRecords.slice(-7).reverse();

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    const record = dailyRecords.find(r => r.date === date);
    if (record) {
      setCorrectedData({
        steps: String(record.steps),
        exerciseMinutes: String(record.exerciseMinutes),
        sleepHours: String(record.sleepHours),
        waterIntake: String(record.waterIntake),
      });
    }
  };

  const handleCorrectSave = () => {
    console.log('[Mine] 修正数据:', selectedDate, correctedData);
    const update: Partial<DailyRecord> = {};
    if (correctedData.steps) update.steps = Number(correctedData.steps);
    if (correctedData.exerciseMinutes) update.exerciseMinutes = Number(correctedData.exerciseMinutes);
    if (correctedData.sleepHours) update.sleepHours = Number(correctedData.sleepHours);
    if (correctedData.waterIntake) update.waterIntake = Number(correctedData.waterIntake);
    
    correctRecord(selectedDate, update);
    setShowCorrectModal(false);
    Taro.showToast({ title: '数据已修正', icon: 'success' });
  };

  const handleMenuClick = (type: string) => {
    console.log('[Mine] 点击菜单项:', type);
    switch (type) {
      case 'sleep':
        Taro.navigateTo({ url: '/pages/sleep/index' });
        break;
      case 'report':
        Taro.navigateTo({ url: '/pages/report/index' });
        break;
      case 'correct':
        setShowCorrectModal(true);
        handleDateSelect(dayjs().format('YYYY-MM-DD'));
        break;
      case 'export':
        Taro.showToast({ title: '数据导出中...', icon: 'loading' });
        setTimeout(() => {
          Taro.showToast({ title: '导出成功', icon: 'success' });
        }, 1500);
        break;
      case 'clear':
        Taro.showModal({
          title: '确认清除',
          content: '确定要清除所有数据吗？此操作不可恢复。',
          confirmColor: '#EF4444',
          success: (res) => {
            if (res.confirm) {
              Taro.showToast({ title: '数据已清除', icon: 'success' });
            }
          }
        });
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.profileCard}>
        <View className={styles.avatar}>
          <Text>👤</Text>
        </View>
        <View className={styles.profileInfo}>
          <Text className={styles.userName}>{userProfile.name}</Text>
          <Text className={styles.userDetail}>
            {userProfile.gender === 'female' ? '女' : userProfile.gender === 'male' ? '男' : '其他'} · {userProfile.age}岁 · {userProfile.height}cm
          </Text>
          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{userProfile.weight}</Text>
              <Text className={styles.statLabel}>体重(kg)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{bmi}</Text>
              <Text className={styles.statLabel} style={{ color: bmiInfo.color }}>{bmiInfo.text}</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{unlockedCount}/{badges.length}</Text>
              <Text className={styles.statLabel}>徽章</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>我的徽章</Text>
        <Text className={styles.seeAll} onClick={() => Taro.showToast({ title: '查看全部', icon: 'none' })}>
          全部
        </Text>
      </View>
      <View className={styles.badgeGrid}>
        {badges.slice(0, 8).map(badge => (
          <BadgeItem key={badge.id} badge={badge} size="sm" />
        ))}
      </View>

      <View className={styles.sectionTitle}>
        <Text>健康工具</Text>
      </View>
      <View className={styles.menuList}>
        <View className={styles.menuItem} onClick={() => handleMenuClick('sleep')}>
          <View className={styles.menuIcon} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <Text>😴</Text>
          </View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>睡眠管理</Text>
            <Text className={styles.menuDesc}>记录睡眠、设置提醒</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('report')}>
          <View className={styles.menuIcon} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <Text>📊</Text>
          </View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>健康报告</Text>
            <Text className={styles.menuDesc}>查看健康趋势分析</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('correct')}>
          <View className={styles.menuIcon} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Text>✏️</Text>
          </View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>数据修正</Text>
            <Text className={styles.menuDesc}>手动修正历史数据</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>提醒设置</Text>
      </View>
      <View className={styles.menuList}>
        {reminders.map(reminder => (
          <View key={reminder.id} className={styles.menuItem}>
            <View className={styles.menuIcon}>
              <Text>{getReminderTypeIcon(reminder.type)}</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>{reminder.title}</Text>
              <Text className={styles.menuDesc}>
                {reminder.time} · {getRepeatText(reminder.repeat)}
              </Text>
            </View>
            <Switch
              className={styles.menuSwitch}
              checked={reminder.enabled}
              color="#22C55E"
              onChange={() => {
                console.log('[Mine] 切换提醒:', reminder.id);
                toggleReminder(reminder.id);
              }}
            />
          </View>
        ))}
      </View>

      <View className={styles.sectionTitle}>
        <Text>隐私设置</Text>
      </View>
      <View className={styles.menuList}>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
            <Text>🔒</Text>
          </View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>健康数据加密</Text>
            <Text className={styles.menuDesc}>保护您的健康数据安全</Text>
          </View>
          <Switch
            className={styles.menuSwitch}
            checked={privacySettings.dataEncryption}
            color="#22C55E"
            onChange={(e) => {
              console.log('[Mine] 切换数据加密');
              updatePrivacySettings({ dataEncryption: e.detail.value });
            }}
          />
        </View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon} style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
            <Text>🔔</Text>
          </View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>推送通知</Text>
            <Text className={styles.menuDesc}>接收健康提醒和建议</Text>
          </View>
          <Switch
            className={styles.menuSwitch}
            checked={privacySettings.allowNotifications}
            color="#22C55E"
            onChange={(e) => {
              console.log('[Mine] 切换通知');
              updatePrivacySettings({ allowNotifications: e.detail.value });
            }}
          />
        </View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <Text>📤</Text>
          </View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>自动备份</Text>
            <Text className={styles.menuDesc}>定期备份健康数据</Text>
          </View>
          <Switch
            className={styles.menuSwitch}
            checked={privacySettings.autoBackup}
            color="#22C55E"
            onChange={(e) => {
              console.log('[Mine] 切换自动备份');
              updatePrivacySettings({ autoBackup: e.detail.value });
            }}
          />
        </View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon} style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
            <Text>👆</Text>
          </View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>生物识别认证</Text>
            <Text className={styles.menuDesc}>使用指纹/面容解锁</Text>
          </View>
          <Switch
            className={styles.menuSwitch}
            checked={privacySettings.biometricAuth}
            color="#22C55E"
            onChange={(e) => {
              console.log('[Mine] 切换生物认证');
              updatePrivacySettings({ biometricAuth: e.detail.value });
            }}
          />
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>数据管理</Text>
      </View>
      <View className={styles.menuList}>
        <View className={styles.menuItem} onClick={() => handleMenuClick('export')}>
          <View className={styles.menuIcon} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
            <Text>📥</Text>
          </View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>导出数据</Text>
            <Text className={styles.menuDesc}>导出健康数据报告</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('clear')}>
          <View className={styles.menuIcon} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <Text>🗑️</Text>
          </View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>清除数据</Text>
            <Text className={styles.menuDesc}>清除所有健康记录</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      {showCorrectModal && (
        <View className={styles.correctModal} onClick={() => setShowCorrectModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>数据修正</Text>

            <View className={styles.correctField}>
              <Text className={styles.fieldLabel}>选择日期</Text>
              <ScrollView scrollX className={styles.dateSelector} enhanced showScrollbar={false}>
                {recentRecords.map(record => (
                  <View
                    key={record.date}
                    className={classnames(styles.dateOption, selectedDate === record.date && styles.active)}
                    onClick={() => handleDateSelect(record.date)}
                  >
                    <Text>{dayjs(record.date).format('MM/DD')}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View className={styles.correctField}>
              <Text className={styles.fieldLabel}>步数</Text>
              <Input
                className={styles.fieldInput}
                type="number"
                placeholder="请输入步数"
                value={correctedData.steps}
                onInput={(e) => setCorrectedData(prev => ({ ...prev, steps: e.detail.value }))}
              />
            </View>

            <View className={styles.correctField}>
              <Text className={styles.fieldLabel}>运动时长（分钟）</Text>
              <Input
                className={styles.fieldInput}
                type="number"
                placeholder="请输入运动时长"
                value={correctedData.exerciseMinutes}
                onInput={(e) => setCorrectedData(prev => ({ ...prev, exerciseMinutes: e.detail.value }))}
              />
            </View>

            <View className={styles.correctField}>
              <Text className={styles.fieldLabel}>睡眠时长（小时）</Text>
              <Input
                className={styles.fieldInput}
                type="digit"
                placeholder="请输入睡眠时长"
                value={correctedData.sleepHours}
                onInput={(e) => setCorrectedData(prev => ({ ...prev, sleepHours: e.detail.value }))}
              />
            </View>

            <View className={styles.correctField}>
              <Text className={styles.fieldLabel}>饮水量（毫升）</Text>
              <Input
                className={styles.fieldInput}
                type="number"
                placeholder="请输入饮水量"
                value={correctedData.waterIntake}
                onInput={(e) => setCorrectedData(prev => ({ ...prev, waterIntake: e.detail.value }))}
              />
            </View>

            <View className={styles.modalActions}>
              <View
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowCorrectModal(false)}
              >
                <Text>取消</Text>
              </View>
              <View
                className={classnames(styles.modalBtn, styles.confirm)}
                onClick={handleCorrectSave}
              >
                <Text>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default MinePage;
