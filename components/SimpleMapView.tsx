import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppContext } from '../contexts/AppContextWithPersistence';

interface MapViewComponentProps {
  style?: any;
}

export default function MapViewComponent({ style }: MapViewComponentProps) {
  const { state } = useAppContext();
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Request location permissions and get current location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get location');
    }
  };

  // Get visible POIs from context
  const visiblePois = state.pointsOfInterest.filter(poi => poi.isVisible);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.title}>🗺️ Map View</Text>
        <Text style={styles.subtitle}>Interactive map coming soon</Text>
        
        <View style={styles.infoContainer}>
          {userLocation ? (
            <>
              <Text style={styles.infoText}>
                📍 Your Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </Text>
              <Text style={styles.infoText}>
                🔍 Search Radius: {(state.settings.searchRadius / 1000).toFixed(1)}km
              </Text>
            </>
          ) : (
            <Text style={styles.infoText}>
              {locationError || '📡 Getting your location...'}
            </Text>
          )}
          
          <Text style={styles.infoText}>
            📌 Visible POIs: {visiblePois.length}
          </Text>
          
          {visiblePois.length > 0 && (
            <View style={styles.poiList}>
              <Text style={styles.poiTitle}>Points of Interest:</Text>
              {visiblePois.slice(0, 5).map((poi) => (
                <Text key={poi.id} style={styles.poiItem}>
                  • {poi.name} ({poi.category})
                </Text>
              ))}
              {visiblePois.length > 5 && (
                <Text style={styles.poiItem}>
                  ... and {visiblePois.length - 5} more
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 350,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  poiList: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  poiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  poiItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 10,
  },
});