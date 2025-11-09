import { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContextWithPersistence';

// Custom hook for managing POI categories
export function usePoiCategories() {
  const { state, getPoisByCategory } = useAppContext();

  const categories = useMemo(() => {
    const categorySet = new Set(state.pointsOfInterest.map(poi => poi.category));
    return Array.from(categorySet);
  }, [state.pointsOfInterest]);

  const getCategoryCount = (category: string) => {
    return getPoisByCategory(category).length;
  };

  const getVisibleCategoryCount = (category: string) => {
    return getPoisByCategory(category).filter(poi => poi.isVisible).length;
  };

  return {
    categories,
    getCategoryCount,
    getVisibleCategoryCount,
  };
}

// Custom hook for search functionality
export function usePoiSearch() {
  const { state, getVisiblePois } = useAppContext();

  const searchPoisByRadius = (centerLat: number, centerLng: number, radiusMeters?: number) => {
    const radius = radiusMeters || state.settings.searchRadius;
    const visiblePois = getVisiblePois();

    return visiblePois.filter(poi => {
      const distance = calculateDistance(centerLat, centerLng, poi.latitude, poi.longitude);
      return distance <= radius;
    });
  };

  const searchPoisByName = (query: string) => {
    const visiblePois = getVisiblePois();
    const lowerQuery = query.toLowerCase();

    return visiblePois.filter(poi =>
      poi.name.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    searchPoisByRadius,
    searchPoisByName,
  };
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}