import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface ProgressBarProps {
  progress: number; // Valore da 0 a 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clampedProgress}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
});