import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { syncService } from '../services/syncService';
import { networkUtils } from '../utils/networkUtils';

const SyncStatus = () => {
  const [syncStats, setSyncStats] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    loadSyncStats();
    checkConnection();

    const unsubscribe = networkUtils.subscribeToNetworkChanges((connected) => {
      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  const loadSyncStats = async () => {
    const stats = await syncService.getSyncStats();
    setSyncStats(stats);
    if (stats.lastSyncTimestamp) {
      setLastSyncTime(new Date(stats.lastSyncTimestamp));
    }
  };

  const checkConnection = async () => {
    const connected = await networkUtils.isConnected();
    setIsConnected(connected);
  };


  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diffMs = now - lastSyncTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sync Status</Text>
        <View style={[styles.statusDot, isConnected ? styles.online : styles.offline]} />
      </View>

      {syncStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Orders:</Text>
            <Text style={styles.statValue}>{syncStats.total}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Synced:</Text>
            <Text style={[styles.statValue, styles.synced]}>{syncStats.synced}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pending:</Text>
            <Text style={[styles.statValue, styles.pending]}>{syncStats.unsynced}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Sync:</Text>
            <Text style={styles.statValue}>{formatLastSync()}</Text>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  synced: {
    color: '#4CAF50',
  },
  pending: {
    color: '#FF9800',
  },
});

export default SyncStatus;
