import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { database } from './index';
import { menuService } from '../services/menuService';
import { waiterService } from '../services/waiterService';

export const DatabaseProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      // Database is already initialized in index.js
      // Just seed the initial data if needed
      await menuService.seedMenuData();
      await waiterService.seedWaiters();
      setIsReady(true);
    } catch (err) {
      console.error('Database initialization error:', err);
      setError(err.message);
      setIsReady(true); // Still set ready to avoid blocking the app
    }
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fb3441" />
        <Text style={styles.text}>Initializing database...</Text>
      </View>
    );
  }

  if (error) {
    console.warn('Database error (non-blocking):', error);
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#24222c',
  },
});
