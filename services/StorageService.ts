import AsyncStorage from '@react-native-async-storage/async-storage';

// Local type definitions to avoid circular imports
export interface AppSettings {
  searchRadius: number;
  defaultMapType: 'standard' | 'satellite' | 'hybrid';
  enableNotifications: boolean;
  autoSaveChanges: boolean;
}

export interface PointOfInterest {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  isVisible: boolean;
  createdAt: string;
}

const STORAGE_KEYS = {
  SETTINGS: '@GeoWhisper:settings',
  POINTS_OF_INTEREST: '@GeoWhisper:poi',
} as const;

export class StorageService {
  // Settings
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  static async loadSettings(): Promise<AppSettings | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  }

  // Points of Interest
  static async savePointsOfInterest(pois: PointOfInterest[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(pois);
      await AsyncStorage.setItem(STORAGE_KEYS.POINTS_OF_INTEREST, jsonValue);
    } catch (error) {
      console.error('Error saving POIs:', error);
      throw error;
    }
  }

  static async loadPointsOfInterest(): Promise<PointOfInterest[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.POINTS_OF_INTEREST);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading POIs:', error);
      return [];
    }
  }

  // Clear all data
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.POINTS_OF_INTEREST,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Get storage info (useful for debugging)
  static async getStorageInfo(): Promise<{
    settingsSize?: number;
    poisSize?: number;
    totalKeys: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const geoWhisperKeys = keys.filter((key: string) => key.startsWith('@GeoWhisper:'));
      
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const poisData = await AsyncStorage.getItem(STORAGE_KEYS.POINTS_OF_INTEREST);

      return {
        settingsSize: settingsData?.length,
        poisSize: poisData?.length,
        totalKeys: geoWhisperKeys.length,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { totalKeys: 0 };
    }
  }
}