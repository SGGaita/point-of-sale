import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.APP_API_URL || 'https://pos-web-delta-opal.vercel.app';

export const authService = {
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check if user is ADMIN
      if (data.user.role !== 'ADMIN') {
        throw new Error('Access denied. Only administrators can access this feature.');
      }

      // Store user data in AsyncStorage
      await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
      await AsyncStorage.setItem('authToken', 'authenticated'); // Simple token for now

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred during login',
      };
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('authUser');
      await AsyncStorage.removeItem('authToken');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  async getCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem('authUser');
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const user = await this.getCurrentUser();
      return token === 'authenticated' && user && user.role === 'ADMIN';
    } catch (error) {
      console.error('Check authentication error:', error);
      return false;
    }
  },
};
