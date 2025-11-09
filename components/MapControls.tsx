import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../contexts/AppContextWithPersistence';

interface MapControlsProps {
  onCenterOnUser: () => void;
  onToggleMapType: () => void;
  userLocationAvailable: boolean;
}

export default function MapControls({ 
  onCenterOnUser, 
  onToggleMapType, 
  userLocationAvailable 
}: MapControlsProps) {
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
    <View style={styles.container}>
      {/* Map Type Toggle */}
      <TouchableOpacity 
        style={styles.controlButton} 
        onPress={onToggleMapType}
        accessibilityLabel="Toggle map type"
      >
        <FontAwesome name={getMapTypeIcon()} size={20} color="#007AFF" />
      </TouchableOpacity>

      {/* Center on User */}
      <TouchableOpacity 
        style={[
          styles.controlButton,
          !userLocationAvailable && styles.disabledButton
        ]} 
        onPress={onCenterOnUser}
        disabled={!userLocationAvailable}
        accessibilityLabel="Center on my location"
      >
        <FontAwesome 
          name="location-arrow" 
          size={20} 
          color={userLocationAvailable ? "#007AFF" : "#999"} 
        />
      </TouchableOpacity>

      {/* Radius Controls */}
      <View style={styles.radiusControls}>
        <TouchableOpacity 
          style={styles.radiusButton} 
          onPress={() => handleRadiusChange(false)}
          accessibilityLabel="Decrease search radius"
        >
          <FontAwesome name="minus" size={16} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.radiusDisplay}>
          <Text style={styles.radiusText}>
            {(state.settings.searchRadius / 1000).toFixed(1)}km
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.radiusButton} 
          onPress={() => handleRadiusChange(true)}
          accessibilityLabel="Increase search radius"
        >
          <FontAwesome name="plus" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 15,
    top: 60, // Below status bar and header
    alignItems: 'center',
    gap: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  radiusControls: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 4,
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
  radiusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusDisplay: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  radiusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});