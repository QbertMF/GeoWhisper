import Icon from '@/components/Icon';
import { Text, View } from '@/components/Themed';
import { useAppContext } from '@/contexts/AppContextWithPersistence';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function DetailsScreen() {
  const { getAllPois, state, togglePoiVisibility } = useAppContext();
  
  const allPois = getAllPois();
  
  const handleToggleVisibility = async (poiId: string) => {
    await togglePoiVisibility(poiId);
  };

  const renderPoiItem = ({ item }: { item: any }) => {
    const isManual = item.source !== 'geoapify';
    const categoryIcon = isManual ? 'hand-left' : 'location';
    
    return (
      <TouchableOpacity 
        style={styles.poiItem}
        onPress={() => handleToggleVisibility(item.id)}
      >
        <View style={styles.poiHeader}>
          <View style={styles.poiTitleRow}>
            <Icon 
              name={categoryIcon} 
              size={16} 
              color={isManual ? '#007AFF' : '#FF9500'} 
              style={styles.categoryIcon}
            />
            <Text style={styles.poiName} numberOfLines={2}>
              {item.name}
            </Text>
            <Icon 
              name={item.isVisible ? 'eye' : 'eye-off'} 
              size={16} 
              color={item.isVisible ? '#4ECDC4' : '#999'}
            />
          </View>
          
          <View style={styles.poiDetails}>
            <Text style={styles.poiCategory}>{item.category}</Text>
            {item.address && (
              <Text style={styles.poiAddress} numberOfLines={1}>
                📍 {item.address}
              </Text>
            )}
            <Text style={styles.poiCoordinates}>
              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </Text>
            <Text style={styles.poiSource}>
              {isManual ? '✋ Manual' : '📍 GeoAPIfy'} • {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>POI Details</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            Total: {allPois.length} • Manual: {state.pointsOfInterest.length} • Nearby: {state.fetchedPois.length}
          </Text>
        </View>
      </View>
      
      {allPois.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="location-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No POIs found</Text>
          <Text style={styles.emptySubtext}>
            Move around to discover nearby places or add manual POIs
          </Text>
        </View>
      ) : (
        <FlatList
          data={allPois}
          keyExtractor={(item) => item.id}
          renderItem={renderPoiItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
  },
  poiItem: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  poiHeader: {
    flex: 1,
  },
  poiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    marginRight: 8,
  },
  poiName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  poiDetails: {
    gap: 4,
  },
  poiCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  poiAddress: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  poiCoordinates: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  poiSource: {
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
