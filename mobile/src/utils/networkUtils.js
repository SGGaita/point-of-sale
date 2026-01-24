import NetInfo from '@react-native-community/netinfo';

export const networkUtils = {
  async isConnected() {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  },

  subscribeToNetworkChanges(callback) {
    return NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable;
      callback(isConnected);
    });
  },

  async waitForConnection(timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const connected = await this.isConnected();
      if (connected) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false;
  }
};
