import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../src/theme';

export default function Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Progress</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
});