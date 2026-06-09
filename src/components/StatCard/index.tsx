import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
  trend?: number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color = '#22C55E', trend, onClick }) => {
  return (
    <View className={styles.statCard} onClick={onClick}>
      <View className={styles.icon} style={{ backgroundColor: `${color}15` }}>
        <Text style={{ color }}>{icon}</Text>
      </View>
      <View className={styles.content}>
        <View className={styles.valueRow}>
          <Text className={styles.value}>{value}</Text>
          {trend !== undefined && (
            <Text className={styles.trend} style={{ color: trend >= 0 ? '#22C55E' : '#EF4444' }}>
              {trend >= 0 ? '↑' : '↓'}{Math.abs(trend)}%
            </Text>
          )}
        </View>
        <Text className={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

export default StatCard;
