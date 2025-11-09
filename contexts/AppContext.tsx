import React, { createContext, ReactNode, useContext, useReducer } from 'react';

// Types
export interface PointOfInterest {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  isVisible: boolean;
}

export interface AppSettings {
  searchRadius: number;
  defaultMapType: 'standard' | 'satellite' | 'hybrid';
  enableNotifications: boolean;
}

interface AppState {
  settings: AppSettings;
  pointsOfInterest: PointOfInterest[];
  isLoading: boolean;
}

// Action types
type AppAction =
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_POI'; payload: PointOfInterest }
  | { type: 'UPDATE_POI'; payload: { id: string; updates: Partial<PointOfInterest> } }
  | { type: 'REMOVE_POI'; payload: string }
  | { type: 'SET_POI_VISIBILITY'; payload: { id: string; isVisible: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { settings: AppSettings; pointsOfInterest: PointOfInterest[] } };

// Initial state
const initialState: AppState = {
  settings: {
    searchRadius: 1000, // meters
    defaultMapType: 'standard',
    enableNotifications: true,
  },
  pointsOfInterest: [],
  isLoading: false,
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
    case 'LOAD_DATA':
      return {
        ...state,
        settings: action.payload.settings,
        pointsOfInterest: action.payload.pointsOfInterest,
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
  updateSettings: (settings: Partial<AppSettings>) => void;
  addPointOfInterest: (poi: PointOfInterest) => void;
  togglePoiVisibility: (id: string) => void;
  getVisiblePois: () => PointOfInterest[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const addPointOfInterest = (poi: PointOfInterest) => {
    dispatch({ type: 'ADD_POI', payload: poi });
  };

  const togglePoiVisibility = (id: string) => {
    const poi = state.pointsOfInterest.find(p => p.id === id);
    if (poi) {
      dispatch({ type: 'SET_POI_VISIBILITY', payload: { id, isVisible: !poi.isVisible } });
    }
  };

  const getVisiblePois = () => {
    return state.pointsOfInterest.filter(poi => poi.isVisible);
  };

  const value: AppContextType = {
    state,
    dispatch,
    updateSettings,
    addPointOfInterest,
    togglePoiVisibility,
    getVisiblePois,
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