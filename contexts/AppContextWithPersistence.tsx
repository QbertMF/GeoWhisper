import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { StorageService } from '../services/StorageService';

// Utility function to calculate distance between two coordinates (Haversine formula)
function getDistanceBetweenCoordinates(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Types
export interface PointOfInterest {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  isVisible: boolean;
  createdAt: string;
  source?: 'manual' | 'geoapify'; // Track where POI came from
  address?: string; // Address from GeoAPIfy
  placeId?: string; // GeoAPIfy place ID
}

export interface AppSettings {
  searchRadius: number;
  defaultMapType: 'standard' | 'satellite' | 'hybrid';
  enableNotifications: boolean;
  autoSaveChanges: boolean;
  poiFetchDistance: number; // Distance in meters before triggering new POI fetch
  poiCategories: string[]; // Categories to fetch from GeoAPIfy
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

interface AppState {
  settings: AppSettings;
  pointsOfInterest: PointOfInterest[];
  fetchedPois: PointOfInterest[]; // POIs from GeoAPIfy
  lastLocation: Location | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// Action types
type AppAction =
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_POI'; payload: PointOfInterest }
  | { type: 'UPDATE_POI'; payload: { id: string; updates: Partial<PointOfInterest> } }
  | { type: 'REMOVE_POI'; payload: string }
  | { type: 'SET_POI_VISIBILITY'; payload: { id: string; isVisible: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { settings: AppSettings; pointsOfInterest: PointOfInterest[] } }
  | { type: 'SET_FETCHED_POIS'; payload: PointOfInterest[] }
  | { type: 'UPDATE_LOCATION'; payload: Location }
  | { type: 'CLEAR_FETCHED_POIS' }
  | { type: 'RESET_ALL' };

// Initial state
const initialState: AppState = {
  settings: {
    searchRadius: 10000, // meters (10km)
    defaultMapType: 'standard',
    enableNotifications: true,
    autoSaveChanges: true,
    poiFetchDistance: 500, // meters - fetch new POIs when moving 500m
    poiCategories: ['heritage', 'tourism.attraction', 'memorial'],
  },
  pointsOfInterest: [],
  fetchedPois: [],
  lastLocation: null,
  isLoading: false,
  isInitialized: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'ADD_POI':
      return {
        ...state,
        pointsOfInterest: [...state.pointsOfInterest, action.payload],
      };
    case 'UPDATE_POI':
      return {
        ...state,
        pointsOfInterest: state.pointsOfInterest.map(poi =>
          poi.id === action.payload.id ? { ...poi, ...action.payload.updates } : poi
        ),
      };
    case 'REMOVE_POI':
      return {
        ...state,
        pointsOfInterest: state.pointsOfInterest.filter(poi => poi.id !== action.payload),
      };
    case 'SET_POI_VISIBILITY':
      return {
        ...state,
        pointsOfInterest: state.pointsOfInterest.map(poi =>
          poi.id === action.payload.id ? { ...poi, isVisible: action.payload.isVisible } : poi
        ),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };
    case 'LOAD_DATA':
      return {
        ...state,
        settings: action.payload.settings,
        pointsOfInterest: action.payload.pointsOfInterest,
        isInitialized: true,
      };
    case 'SET_FETCHED_POIS':
      return {
        ...state,
        fetchedPois: action.payload,
      };
    case 'UPDATE_LOCATION':
      return {
        ...state,
        lastLocation: action.payload,
      };
    case 'CLEAR_FETCHED_POIS':
      return {
        ...state,
        fetchedPois: [],
      };
    case 'RESET_ALL':
      return {
        ...initialState,
        isInitialized: true,
      };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  addPointOfInterest: (poi: Omit<PointOfInterest, 'id' | 'createdAt'>) => Promise<void>;
  updatePointOfInterest: (id: string, updates: Partial<PointOfInterest>) => Promise<void>;
  removePointOfInterest: (id: string) => Promise<void>;
  togglePoiVisibility: (id: string) => Promise<void>;
  getVisiblePois: () => PointOfInterest[];
  getPoisByCategory: (category: string) => PointOfInterest[];
  getAllPois: () => PointOfInterest[]; // Combines manual + fetched POIs
  updateLocation: (location: Location) => void;
  setFetchedPois: (pois: PointOfInterest[]) => void;
  clearFetchedPois: () => void;
  shouldFetchPois: (currentLocation: Location) => boolean;
  saveData: () => Promise<void>;
  loadData: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-save when data changes (if enabled)
  useEffect(() => {
    if (state.isInitialized && state.settings.autoSaveChanges) {
      saveData();
    }
  }, [state.settings, state.pointsOfInterest, state.isInitialized]);

  // Helper functions
  const updateSettings = async (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const addPointOfInterest = async (poi: Omit<PointOfInterest, 'id' | 'createdAt'>) => {
    const newPoi: PointOfInterest = {
      ...poi,
      id: `poi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_POI', payload: newPoi });
  };

  const updatePointOfInterest = async (id: string, updates: Partial<PointOfInterest>) => {
    dispatch({ type: 'UPDATE_POI', payload: { id, updates } });
  };

  const removePointOfInterest = async (id: string) => {
    dispatch({ type: 'REMOVE_POI', payload: id });
  };

  const togglePoiVisibility = async (id: string) => {
    const poi = state.pointsOfInterest.find(p => p.id === id);
    if (poi) {
      dispatch({ type: 'SET_POI_VISIBILITY', payload: { id, isVisible: !poi.isVisible } });
    }
  };

  const getVisiblePois = () => {
    return state.pointsOfInterest.filter(poi => poi.isVisible);
  };

  const getPoisByCategory = (category: string) => {
    return state.pointsOfInterest.filter(poi => poi.category === category);
  };

  const saveData = async () => {
    try {
      await Promise.all([
        StorageService.saveSettings(state.settings),
        StorageService.savePointsOfInterest(state.pointsOfInterest),
      ]);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [savedSettings, savedPois] = await Promise.all([
        StorageService.loadSettings(),
        StorageService.loadPointsOfInterest(),
      ]);

      // Ensure settings have all required fields for compatibility
      const settings: AppSettings = {
        ...initialState.settings,
        ...savedSettings,
      };
      
      // Ensure POIs have required fields for compatibility
      const pointsOfInterest = (savedPois || []).map(poi => ({
        ...poi,
        createdAt: poi.createdAt || new Date().toISOString()
      }));

      dispatch({ type: 'LOAD_DATA', payload: { settings, pointsOfInterest } });
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetAllData = async () => {
    try {
      await StorageService.clearAll();
      dispatch({ type: 'RESET_ALL' });
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  };

  // New POI and location functions
  const getAllPois = (): PointOfInterest[] => {
    return [...state.pointsOfInterest, ...state.fetchedPois];
  };

  const updateLocation = (location: Location) => {
    dispatch({ type: 'UPDATE_LOCATION', payload: location });
  };

  const setFetchedPois = (pois: PointOfInterest[]) => {
    dispatch({ type: 'SET_FETCHED_POIS', payload: pois });
  };

  const clearFetchedPois = () => {
    dispatch({ type: 'CLEAR_FETCHED_POIS' });
  };

  const shouldFetchPois = (currentLocation: Location): boolean => {
    if (!state.lastLocation) return true;
    
    // Calculate distance between current and last location
    const distance = getDistanceBetweenCoordinates(
      state.lastLocation.latitude,
      state.lastLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );
    
    return distance >= state.settings.poiFetchDistance;
  };

  const value: AppContextType = {
    state,
    dispatch,
    updateSettings,
    addPointOfInterest,
    updatePointOfInterest,
    removePointOfInterest,
    togglePoiVisibility,
    getVisiblePois,
    getPoisByCategory,
    getAllPois,
    updateLocation,
    setFetchedPois,
    clearFetchedPois,
    shouldFetchPois,
    saveData,
    loadData,
    resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}