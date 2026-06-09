import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Switch, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useHealthStore } from '@/store/useHealthStore';
import CourseCard from '@/components/CourseCard';
import { getGoalTypeIcon, getCourseCategoryText } from '@/utils/health';
import type { GoalType, CourseCategory } from '@/types/health';

const PlanPage: React.FC = () => {
  const {
    goals,
    courses,
    addGoal,
    deleteGoal,
    toggleCourseFavorite,
    markCourseCompleted,
  } = useHealthStore();

  const [activeTab, setActiveTab] = useState<'goals' | 'courses'>('goals');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [newGoal, setNewGoal] = useState({
    type: 'steps' as GoalType,
    target: 8000,
    reminder: true,
    reminderTime: '21:00',
  });

  const goalTypes = [
    { type: 'steps' as GoalType, icon: '👟', label: '步数' },
    { type: 'exercise' as GoalType, icon: '💪', label: '运动' },
    { type: 'sleep' as GoalType, icon: '😴', label: '睡眠' },
    { type: 'water' as GoalType, icon: '💧', label: '饮水' },
  ];

  const categories = [
    { id: 'all' as const, label: '全部' },
    { id: 'breathing' as const, label: '呼吸训练' },
    { id: 'meditation' as const, label: '冥想' },
    { id: 'stretching' as const, label: '拉伸' },
    { id: 'strength' as const, label: '力量' },
  ];

  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'all') return courses;
    return courses.filter(c => c.category === selectedCategory);
  }, [courses, selectedCategory]);

  const handleAddGoal = () => {
    console.log('[Plan] 创建新目标:', newGoal);
    const typeInfo = goalTypes.find(t => t.type === newGoal.type);
    addGoal({
      type: newGoal.type,
      title: `${typeInfo?.label || ''}目标`,
      target: newGoal.target,
      unit: newGoal.type === 'steps' ? '步' : newGoal.type === 'sleep' ? '小时' : newGoal.type === 'water' ? '毫升' : '分钟',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      reminder: newGoal.reminder,
      reminderTime: newGoal.reminder ? newGoal.reminderTime : undefined,
    });
    setShowModal(false);
    Taro.showToast({ title: '目标创建成功', icon: 'success' });
  };

  const handleDeleteGoal = (id: string) => {
    console.log('[Plan] 删除目标:', id);
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个目标吗？',
      success: (res) => {
        if (res.confirm) {
          deleteGoal(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const handleStartCourse = (id: string) => {
    console.log('[Plan] 开始课程:', id);
    markCourseCompleted(id);
    Taro.switchTab({ url: '/pages/training/index' });
  };

  const getGoalColor = (type: GoalType): string => {
    const colors: Record<GoalType, string> = {
      steps: '#22C55E',
      exercise: '#06B6D4',
      sleep: '#8B5CF6',
      water: '#3B82F6',
      weight: '#F59E0B',
    };
    return colors[type] || '#22C55E';
  };

  const getGoalPlaceholder = (type: GoalType): string => {
    const placeholders: Record<GoalType, string> = {
      steps: '8000',
      exercise: '150',
      sleep: '8',
      water: '2000',
      weight: '60',
    };
    return placeholders[type] || '';
  };

  const getGoalUnit = (type: GoalType): string => {
    const units: Record<GoalType, string> = {
      steps: '步',
      exercise: '分钟/周',
      sleep: '小时/天',
      water: '毫升/天',
      weight: 'kg',
    };
    return units[type] || '';
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'goals' && styles.active)}
          onClick={() => setActiveTab('goals')}
        >
          <Text>我的目标</Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'courses' && styles.active)}
          onClick={() => setActiveTab('courses')}
        >
          <Text>训练课程</Text>
        </View>
      </View>

      {activeTab === 'goals' && (
        <>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>进行中的目标</Text>
            <Text className={styles.seeAll}>{goals.length} 个目标</Text>
          </View>

          {goals.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🎯</Text>
              <Text className={styles.emptyText}>还没有目标，点击右下角按钮创建一个吧</Text>
            </View>
          ) : (
            goals.map(goal => {
              const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100);
              const color = getGoalColor(goal.type);
              return (
                <View key={goal.id} className={styles.goalCard}>
                  <View
                    className={styles.goalIcon}
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Text style={{ color }}>{getGoalTypeIcon(goal.type)}</Text>
                  </View>
                  <View className={styles.goalContent}>
                    <View className={styles.goalHeader}>
                      <Text className={styles.goalTitle}>{goal.title}</Text>
                      <Text className={styles.goalPercent}>{percent}%</Text>
                    </View>
                    <Text className={styles.goalValues}>
                      {goal.current} / {goal.target} {goal.unit}
                    </Text>
                    <View className={styles.progressBar}>
                      <View
                        className={styles.progressFill}
                        style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)` }}
                      />
                    </View>
                  </View>
                  <View
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    <Text>×</Text>
                  </View>
                </View>
              );
            })
          )}

          <View className={styles.addBtn} onClick={() => setShowModal(true)}>
            <Text>+</Text>
          </View>
        </>
      )}

      {activeTab === 'courses' && (
        <>
          <ScrollView
            scrollX
            className={styles.categoryFilter}
            enhanced
            showScrollbar={false}
          >
            {categories.map(cat => (
              <View
                key={cat.id}
                className={classnames(styles.categoryItem, selectedCategory === cat.id && styles.active)}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Text>{cat.label}</Text>
              </View>
            ))}
          </ScrollView>

          <View className={styles.courseList}>
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onFavorite={() => toggleCourseFavorite(course.id)}
                onStart={() => handleStartCourse(course.id)}
              />
            ))}
          </View>
        </>
      )}

      {showModal && (
        <View className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>新建目标</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>目标类型</Text>
              <View className={styles.typeSelector}>
                {goalTypes.map(type => (
                  <View
                    key={type.type}
                    className={classnames(styles.typeOption, newGoal.type === type.type && styles.active)}
                    onClick={() => {
                      setNewGoal(prev => ({
                        ...prev,
                        type: type.type,
                        target: Number(getGoalPlaceholder(type.type)),
                      }));
                    }}
                  >
                    <Text className={styles.icon}>{type.icon}</Text>
                    <Text className={styles.label}>{type.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>目标值（{getGoalUnit(newGoal.type)}）</Text>
              <Input
                className={styles.inputField}
                type="number"
                placeholder={getGoalPlaceholder(newGoal.type)}
                value={String(newGoal.target)}
                onInput={(e) => setNewGoal(prev => ({ ...prev, target: Number(e.detail.value) }))}
              />
            </View>

            <View className={styles.formGroup}>
              <View className={styles.switchRow}>
                <Text className={styles.switchLabel}>开启提醒</Text>
                <Switch
                  checked={newGoal.reminder}
                  color="#22C55E"
                  onChange={(e) => setNewGoal(prev => ({ ...prev, reminder: e.detail.value }))}
                />
              </View>
            </View>

            <View className={styles.modalActions}>
              <View
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowModal(false)}
              >
                <Text>取消</Text>
              </View>
              <View
                className={classnames(styles.modalBtn, styles.confirm)}
                onClick={handleAddGoal}
              >
                <Text>创建</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default PlanPage;
