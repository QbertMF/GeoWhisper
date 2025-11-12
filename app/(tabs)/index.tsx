import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import InteractiveMap from '@/components/InteractiveMap';
import { Text, View } from '@/components/Themed';
import { useAppContext } from '@/contexts/AppContextWithPersistence';
import { useLocationWithPois } from '@/hooks/useLocationWithPois';
import { usePoiCategories } from '@/hooks/usePoiUtils';

export default function HomeScreen() {
  console.log('🏠 HomeScreen: Component rendering...');
  
  const { 
    state, 
    addPointOfInterest, 
    updateSettings, 
    getAllPois 
  } = useAppContext();

  const { categories } = usePoiCategories();
  const { 
    location, 
    isLoading: locationLoading, 
    hasPermission, 
    isFetchingPois,
    refreshPois,
    fetchedPoisCount 
  } = useLocationWithPois();

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

  const allPois = getAllPois();

  return (
    <View style={styles.container}>
      {/* Interactive Map View */}
      <InteractiveMap style={styles.mapView} />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            POIs: {allPois.length} ({state.pointsOfInterest.length} manual, {fetchedPoisCount} nearby)
          </Text>
          {isFetchingPois && (
            <Text style={styles.fetchingText}>🔄 Fetching nearby places...</Text>
          )}
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddSamplePoi}>
            <Text style={styles.actionButtonText}>Add Sample POI</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.refreshButton]} 
            onPress={refreshPois}
            disabled={!location || isFetchingPois}
          >
            <Text style={styles.actionButtonText}>
              {isFetchingPois ? '🔄' : '🔍'} Refresh Places
            </Text>
          </TouchableOpacity>
        </View>
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
  statusRow: {
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  fetchingText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  refreshButton: {
    backgroundColor: '#FF9500',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
