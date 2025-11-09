import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import InteractiveMap from '@/components/InteractiveMap';
import { Text, View } from '@/components/Themed';
import { useAppContext } from '@/contexts/AppContextWithPersistence';
import { useLocation } from '@/hooks/useLocation';
import { usePoiCategories } from '@/hooks/usePoiUtils';

export default function HomeScreen() {
  const { 
    state, 
    addPointOfInterest, 
    updateSettings, 
    getVisiblePois 
  } = useAppContext();

  const { categories } = usePoiCategories();
  const { location, isLoading: locationLoading, hasPermission } = useLocation();

  const handleAddSamplePoi = async () => {
    // Use current location if available, otherwise use default coordinates
    const baseLocation = location || { latitude: 37.7749, longitude: -122.4194 };
    
    await addPointOfInterest({
      name: `Sample POI ${Date.now()}`,
      latitude: baseLocation.latitude + (Math.random() - 0.5) * 0.01,
      longitude: baseLocation.longitude + (Math.random() - 0.5) * 0.01,
      category: 'restaurant',
      isVisible: true,
    });
  };

  const visiblePois = getVisiblePois();

  return (
    <View style={styles.container}>
      {/* Interactive Map View */}
      <InteractiveMap style={styles.mapView} />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddSamplePoi}>
          <Text style={styles.actionButtonText}>Add Sample POI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
  actionBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
