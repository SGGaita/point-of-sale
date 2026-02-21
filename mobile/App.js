import React, {useState, useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {DatabaseProvider} from './src/database/DatabaseProvider';
import SplashScreen from './src/components/SplashScreen';
import {syncService} from './src/services/syncService';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      // Wait for minimum splash screen duration (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Start auto-sync after app is loaded
    if (!isLoading) {
      console.log('Starting auto-sync service...');
      
      // Initial sync on app start
      syncService.syncOrdersToBackend().catch(err => {
        console.log('Initial sync failed:', err.message);
      });

      // Start auto-sync every 5 minutes
      const stopAutoSync = syncService.startAutoSync(5);

      // Cleanup on unmount
      return () => {
        console.log('Stopping auto-sync service...');
        stopAutoSync();
      };
    }
  }, [isLoading]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <DatabaseProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
