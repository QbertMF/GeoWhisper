import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useAppContext } from '../contexts/AppContextWithPersistence';
import MapControlsOverlay from './MapControlsOverlay';

interface InteractiveMapProps {
  style?: any;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function InteractiveMap({ style }: InteractiveMapProps) {
  const { state } = useAppContext();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);

  // Request location permissions and get current location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Auto-center map when user location is available
  useEffect(() => {
    if (userLocation && mapReady && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLocation, mapReady]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location permission is required to show your position on the map',
          [{ text: 'OK' }]
        );
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
      Alert.alert('Location Error', 'Unable to get your current location');
    }
  };

  const handleMapReady = () => {
    setMapReady(true);
    console.log('Map is ready');
  };

  const handlePoiPress = (poiId: string) => {
    setSelectedPoi(selectedPoi === poiId ? null : poiId);
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  // Get visible POIs from context
  const visiblePois = state.pointsOfInterest.filter(poi => poi.isVisible);

  // Calculate initial region
  const getInitialRegion = () => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    
    // Default to San Francisco if no location
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  const searchRadius = state.settings.searchRadius;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={getInitialRegion()}
        onMapReady={handleMapReady}
        showsUserLocation={true}
        showsMyLocationButton={false} // We'll use our custom button
        showsCompass={true}
        mapType={state.settings.defaultMapType}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {/* Search radius circle around user location */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={searchRadius}
            strokeColor="rgba(0, 122, 255, 0.5)"
            fillColor="rgba(0, 122, 255, 0.1)"
            strokeWidth={2}
          />
        )}

        {/* POI Markers */}
        {visiblePois.map((poi) => (
          <Marker
            key={poi.id}
            coordinate={{
              latitude: poi.latitude,
              longitude: poi.longitude,
            }}
            title={poi.name}
            description={`Category: ${poi.category}`}
            onPress={() => handlePoiPress(poi.id)}
            pinColor={selectedPoi === poi.id ? '#FF6B6B' : '#4ECDC4'}
          />
        ))}
      </MapView>
      
      {/* Controls Overlay */}
      <MapControlsOverlay
        onCenterOnUser={centerOnUserLocation}
        userLocationAvailable={!!userLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});