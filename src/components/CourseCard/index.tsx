import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Course } from '@/types/health';
import { getCourseCategoryText, getDifficultyText, getDifficultyColor } from '@/utils/health';

interface CourseCardProps {
  course: Course;
  onFavorite?: () => void;
  onStart?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onFavorite, onStart }) => {
  return (
    <View className={styles.courseCard}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.image}
          src={course.imageUrl}
          mode="aspectFill"
        />
        <View className={styles.favorite} onClick={onFavorite}>
          <Text>{course.isFavorite ? '❤️' : '🤍'}</Text>
        </View>
        <View className={styles.duration}>
          <Text>{course.duration}分钟</Text>
        </View>
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.title}>{course.title}</Text>
          <View 
            className={styles.difficulty}
            style={{ 
              backgroundColor: `${getDifficultyColor(course.difficulty)}15`,
              color: getDifficultyColor(course.difficulty)
            }}
          >
            {getDifficultyText(course.difficulty)}
          </View>
        </View>
        <Text className={styles.description}>{course.description}</Text>
        <View className={styles.footer}>
          <View className={styles.category}>
            <Text className={styles.categoryText}>{getCourseCategoryText(course.category)}</Text>
            <Text className={styles.completed}>已完成 {course.timesCompleted} 次</Text>
          </View>
          <View className={styles.startBtn} onClick={onStart}>
            <Text>开始</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CourseCard;
