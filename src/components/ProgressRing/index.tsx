import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ProgressRingProps {
  progress: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  unit?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  target,
  size = 160,
  strokeWidth = 12,
  color = '#22C55E',
  showLabel = true,
  unit = '%',
}) => {
  const percentage = Math.min(Math.round((progress / target) * 100), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <View className={styles.progressRing} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.svg}>
        <circle
          className={styles.bgCircle}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className={styles.progressCircle}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showLabel && (
        <View className={styles.label}>
          <Text className={styles.percentage} style={{ color }}>
            {percentage}
          </Text>
          <Text className={styles.unit}>{unit}</Text>
        </View>
      )}
    </View>
  );
};

export default ProgressRing;
