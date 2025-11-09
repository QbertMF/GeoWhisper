import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../contexts/AppContextWithPersistence';

interface MapControlsOverlayProps {
  onCenterOnUser?: () => void;
  userLocationAvailable: boolean;
}

export default function MapControlsOverlay({ 
  onCenterOnUser, 
  userLocationAvailable 
}: MapControlsOverlayProps) {
  const { state, updateSettings } = useAppContext();

  const handleRadiusChange = (increase: boolean) => {
    const currentRadius = state.settings.searchRadius;
    const step = 250; // 250m steps
    const minRadius = 250;
    const maxRadius = 5000;
    
    let newRadius = increase ? currentRadius + step : currentRadius - step;
    newRadius = Math.max(minRadius, Math.min(maxRadius, newRadius));
    
    if (newRadius !== currentRadius) {
      updateSettings({ searchRadius: newRadius });
    }
  };

  const handleMapTypeToggle = () => {
    const mapTypes = ['standard', 'satellite', 'hybrid'] as const;
    const currentIndex = mapTypes.indexOf(state.settings.defaultMapType);
    const nextIndex = (currentIndex + 1) % mapTypes.length;
    updateSettings({ defaultMapType: mapTypes[nextIndex] });
  };

  const getMapTypeIcon = () => {
    switch (state.settings.defaultMapType) {
      case 'satellite':
        return 'globe';
      case 'hybrid':
        return 'map';
      default:
        return 'map-o';
    }
  };

  return (
    <>
      {/* Status overlay - top left */}
      <View style={styles.statusOverlay}>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            📍 {(state.settings.searchRadius / 1000).toFixed(1)}km
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            📌 {state.pointsOfInterest.filter(poi => poi.isVisible).length} POIs
          </Text>
        </View>
      </View>

      {/* Controls overlay - top right */}
      <View style={styles.controlsOverlay}>
        {/* Map Type Toggle */}
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleMapTypeToggle}
          accessibilityLabel="Toggle map type"
        >
          <FontAwesome name={getMapTypeIcon()} size={20} color="#007AFF" />
        </TouchableOpacity>

        {/* Center on User */}
        {userLocationAvailable && onCenterOnUser && (
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={onCenterOnUser}
            accessibilityLabel="Center on my location"
          >
            <FontAwesome name="location-arrow" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}

        {/* Radius Controls */}
        <View style={styles.radiusControls}>
          <TouchableOpacity 
            style={styles.radiusButton} 
            onPress={() => handleRadiusChange(false)}
            accessibilityLabel="Decrease search radius"
          >
            <FontAwesome name="minus" size={14} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radiusButton} 
            onPress={() => handleRadiusChange(true)}
            accessibilityLabel="Increase search radius"
          >
            <FontAwesome name="plus" size={14} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  statusOverlay: {
    position: 'absolute',
    top: 60,
    left: 15,
    gap: 8,
    zIndex: 1000,
  },
  statusItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 60,
    right: 15,
    alignItems: 'center',
    gap: 10,
    zIndex: 1000,
  },
  controlButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  radiusControls: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 22.5,
    paddingVertical: 4,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  radiusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
});