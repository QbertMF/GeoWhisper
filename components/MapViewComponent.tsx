import * as Location from 'expo-location';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import type { PointOfInterest } from '../contexts/AppContextWithPersistence';
import { useAppContext } from '../contexts/AppContextWithPersistence';

interface MapViewComponentProps {
  style?: any;
}

export interface MapViewComponentRef {
  centerOnUser: () => void;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

const MapViewComponent = forwardRef<MapViewComponentRef, MapViewComponentProps>(({ style }, ref) => {
  const { state, updateSettings } = useAppContext();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Request location permissions and get current location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Center map when user location becomes available
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

      // Center map on user location when ready
      if (mapReady && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your current location');
    }
  };

  const handleMapReady = () => {
    setMapReady(true);
  };

  const handlePoiSelect = (poi: PointOfInterest) => {
    setSelectedPoi(poi.id);
    
    // Center map on selected POI
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: poi.latitude,
        longitude: poi.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const handleMapPress = () => {
    setSelectedPoi(null);
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

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    centerOnUser: centerOnUserLocation,
  }));

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

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={getInitialRegion()}
        onMapReady={handleMapReady}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType={state.settings.defaultMapType}
      >
        {/* Search radius circle around user location */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={state.settings.searchRadius}
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
            onPress={() => handlePoiSelect(poi)}
            pinColor={selectedPoi === poi.id ? '#FF6B6B' : '#4ECDC4'}
          >
            {/* Custom marker for selected POI */}
            {selectedPoi === poi.id && (
              <View style={styles.selectedMarker}>
                <View style={styles.selectedMarkerInner} />
              </View>
            )}
          </Marker>
        ))}

        {/* User location marker (custom if needed) */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="#007AFF"
          />
        )}
      </MapView>
    </View>
  );
});

MapViewComponent.displayName = 'MapViewComponent';

export default MapViewComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  selectedMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
});