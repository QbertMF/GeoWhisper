import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationState {
  location: LocationCoords | null;
  isLoading: boolean;
  hasPermission: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: false,
    hasPermission: false,
    error: null,
  });

  // Request permission and get location
  const requestLocation = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: false,
          error: 'Location permission denied',
        }));
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setState({
        location,
        isLoading: false,
        hasPermission: true,
        error: null,
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get location',
      }));
      console.error('Location error:', error);
    }
  };

  // Watch position (optional for real-time updates)
  const watchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update when moved 10 meters
        },
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setState(prev => ({
            ...prev,
            location,
            hasPermission: true,
          }));
        }
      );

    } catch (error) {
      console.error('Watch location error:', error);
    }
  };

  // Initialize location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  return {
    ...state,
    requestLocation,
    watchLocation,
  };
}