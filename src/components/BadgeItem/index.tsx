import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Badge } from '@/types/health';

interface BadgeItemProps {
  badge: Badge;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, size = 'md', onClick }) => {
  const progress = Math.min((badge.progress / badge.target) * 100, 100);
  
  return (
    <View
      className={classnames(styles.badgeItem, styles[size], !badge.unlocked && styles.locked)}
      onClick={onClick}
    >
      <View className={styles.icon}>
        <Text className={styles.emoji}>{badge.icon}</Text>
        {!badge.unlocked && (
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${progress}%` }} />
          </View>
        )}
      </View>
      <Text className={styles.title}>{badge.title}</Text>
      <Text className={styles.description}>
        {badge.unlocked 
          ? `已解锁 · ${badge.unlockedDate?.slice(5)}` 
          : `${badge.progress}/${badge.target}`
        }
      </Text>
    </View>
  );
};

export default BadgeItem;
