import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import type { Location as AppLocation } from '../contexts/AppContextWithPersistence';
import { useAppContext } from '../contexts/AppContextWithPersistence';
import { GeoApifyService } from '../services/GeoApifyService';

export interface LocationState {
  location: AppLocation | null;
  isLoading: boolean;
  hasPermission: boolean;
  error: string | null;
  isFetchingPois: boolean;
}

export function useLocationWithPois() {
  const { state, updateLocation, setFetchedPois, shouldFetchPois } = useAppContext();
  const [locationState, setLocationState] = useState<LocationState>({
    location: state.lastLocation,
    isLoading: false,
    hasPermission: false,
    error: null,
    isFetchingPois: false,
  });
  
  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const isInitializedRef = useRef(false);
  const fetchTimeoutRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);

  // Fetch POIs from GeoAPIfy
  const fetchPoisForLocation = async (location: AppLocation) => {
    if (!location || state.settings.poiCategories.length === 0) {
      console.log('⚠️ POI fetch skipped: Missing location or no categories configured');
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('⚠️ POI fetch already in progress, skipping');
      return;
    }

    console.log(`🚀 Starting POI fetch at ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)} (${state.settings.searchRadius}m)`);

    isFetchingRef.current = true;
    setLocationState(prev => ({ ...prev, isFetchingPois: true }));

    try {
      const pois = await GeoApifyService.fetchPoisNearLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: state.settings.searchRadius,
        categories: state.settings.poiCategories,
        limit: 20,
      });

      setFetchedPois(pois);
      console.log(`✅ POI FETCH COMPLETED: Successfully fetched ${pois.length} POIs`);

    } catch (error) {
      console.error('Failed to fetch POIs:', error);
      setLocationState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch nearby places'
      }));
    } finally {
      isFetchingRef.current = false;
      setLocationState(prev => ({ ...prev, isFetchingPois: false }));
    }
  };

  // Handle location update
  const handleLocationUpdate = (newLocation: AppLocation) => {
    updateLocation(newLocation);
    setLocationState(prev => ({ ...prev, location: newLocation, error: null }));

    // Check if we should fetch POIs
    const shouldFetch = shouldFetchPois(newLocation);
    
    if (shouldFetch) {
      console.log(`🎯 Location changed significantly - triggering POI fetch`);
      
      // Clear any pending fetch timeout to prevent duplicates
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Debounce the fetch to prevent rapid successive calls
      fetchTimeoutRef.current = setTimeout(() => {
        fetchPoisForLocation(newLocation);
      }, 1000); // 1 second debounce
    }
  };

  // Request location permission and get current position
  const requestLocation = async () => {
    setLocationState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationState(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: false,
          error: 'Location permission denied',
        }));
        return;
      }

      setLocationState(prev => ({ ...prev, hasPermission: true }));

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation: AppLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || undefined,
        timestamp: position.timestamp,
      };

      handleLocationUpdate(newLocation);

    } catch (error) {
      setLocationState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get location',
      }));
      console.error('Location error:', error);
    } finally {
      setLocationState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Start watching location changes
  const startLocationWatch = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return;
      }

      // Stop existing watch if any
      if (watchSubscriptionRef.current) {
        watchSubscriptionRef.current.remove();
      }

      watchSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: state.settings.poiFetchDistance / 2, // Watch at half the fetch distance
        },
        (position) => {
          const newLocation: AppLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || undefined,
            timestamp: position.timestamp,
          };

          handleLocationUpdate(newLocation);
        }
      );

      console.log('Location watch started');

    } catch (error) {
      console.error('Failed to start location watch:', error);
    }
  };

  // Stop watching location
  const stopLocationWatch = () => {
    if (watchSubscriptionRef.current) {
      watchSubscriptionRef.current.remove();
      watchSubscriptionRef.current = null;
      console.log('Location watch stopped');
    }
  };

  // Manually refresh POIs for current location
  const refreshPois = async () => {
    if (locationState.location) {
      await fetchPoisForLocation(locationState.location);
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      requestLocation();
    }

    return () => {
      stopLocationWatch();
    };
  }, []);

  // Auto-start watch when permission is granted
  useEffect(() => {
    if (locationState.hasPermission && !watchSubscriptionRef.current) {
      startLocationWatch();
    }
  }, [locationState.hasPermission]);

  return {
    ...locationState,
    requestLocation,
    startLocationWatch,
    stopLocationWatch,
    refreshPois,
    fetchedPoisCount: state.fetchedPois.length,
  };
}