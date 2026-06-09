import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { moodOptions } from '@/utils/health';
import type { MoodType } from '@/types/health';

interface MoodSelectorProps {
  value: MoodType;
  onChange: (mood: MoodType) => void;
  size?: 'sm' | 'md' | 'lg';
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ value, onChange, size = 'md' }) => {
  return (
    <View className={styles.moodSelector}>
      {moodOptions.map((mood) => (
        <View
          key={mood.type}
          className={classnames(
            styles.moodItem,
            styles[size],
            value === mood.type && styles.active
          )}
          style={{ 
            borderColor: value === mood.type ? mood.color : 'transparent',
            backgroundColor: value === mood.type ? `${mood.color}15` : '#f5f5f5'
          }}
          onClick={() => onChange(mood.type)}
        >
          <Text className={styles.emoji}>{mood.emoji}</Text>
          <Text className={styles.label} style={{ color: value === mood.type ? mood.color : '#86909C' }}>
            {mood.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default MoodSelector;
