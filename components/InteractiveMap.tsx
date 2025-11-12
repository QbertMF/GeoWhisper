import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useAppContext } from '../contexts/AppContextWithPersistence';
import { useLocationWithPois } from '../hooks/useLocationWithPois';
import MapControlsOverlay from './MapControlsOverlay';

interface InteractiveMapProps {
  style?: any;
}

export default function InteractiveMap({ style }: InteractiveMapProps) {
  console.log('🗺️ InteractiveMap: Component rendering...');
  
  const { state } = useAppContext();
  const { location: userLocation, hasPermission } = useLocationWithPois();
  
  console.log('🗺️ InteractiveMap: Location available:', !!userLocation, 'Permission:', hasPermission);
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);

  // Auto-center map when user location changes and map is ready
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

  // Get all visible POIs from context (manual + fetched)
  const { getAllPois } = useAppContext();
  const allPois = getAllPois();
  const visiblePois = allPois.filter(poi => poi.isVisible);

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
        {visiblePois.map((poi) => {
          const isSelected = selectedPoi === poi.id;
          const isFromGeoAPIfy = poi.source === 'geoapify';
          
          // Choose pin color based on source and selection
          let pinColor = '#4ECDC4'; // Default manual POI color
          if (isFromGeoAPIfy) {
            pinColor = '#FF9500'; // Orange for GeoAPIfy POIs
          }
          if (isSelected) {
            pinColor = '#FF6B6B'; // Red when selected
          }

          return (
            <Marker
              key={poi.id}
              coordinate={{
                latitude: poi.latitude,
                longitude: poi.longitude,
              }}
              title={poi.name}
              description={`${poi.category}${poi.address ? `\n${poi.address}` : ''}${isFromGeoAPIfy ? '\n📍 From GeoAPIfy' : '\n✋ Manual'}`}
              onPress={() => handlePoiPress(poi.id)}
              pinColor={pinColor}
            />
          );
        })}
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