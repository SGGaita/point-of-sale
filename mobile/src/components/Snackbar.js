import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Snackbar = ({visible, message, type = 'success', duration = 3000, onDismiss}) => {
  const translateY = new Animated.Value(100);

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onDismiss) {
            onDismiss();
          }
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss, translateY]);

  if (!visible) {
    return null;
  }

  const backgroundColor = type === 'success' ? '#27AE60' : '#E74C3C';
  const iconName = type === 'success' ? 'check-circle' : 'error';

  return (
    <Animated.View
      style={[
        styles.container,
        {backgroundColor, transform: [{translateY}]},
      ]}>
      <Icon name={iconName} size={24} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default Snackbar;
