import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, typography} from '../theme/theme';

const SplashScreen = () => {
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    >
      <View style={styles.content}>
        <Text style={styles.appName}>KITCHEN POS</Text>
        <ActivityIndicator 
          size="large" 
          color={colors.white} 
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  appName: {
    fontSize: typography.fontSize.massive,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: typography.fontSize.xl,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
