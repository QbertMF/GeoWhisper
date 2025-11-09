import { API_CONFIG, buildGeoApifyUrl } from '../constants/ApiKeys';
import type { PointOfInterest } from '../contexts/AppContextWithPersistence';

// GeoAPIfy response types
export interface GeoApifyPlace {
  place_id: string;
  properties: {
    name: string;
    formatted: string;
    categories: string[];
    datasource: {
      sourcename: string;
      attribution: string;
    };
    place_id: string;
  };
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface GeoApifyResponse {
  type: string;
  features: GeoApifyPlace[];
  query?: {
    text?: string;
    parsed?: any;
  };
}

export interface FetchPoisOptions {
  latitude: number;
  longitude: number;
  radius: number; // in meters
  categories: string[];
  limit?: number;
}

// Convert GeoAPIfy place to our POI format
function convertGeoApifyToPoi(place: GeoApifyPlace): PointOfInterest {
  return {
    id: `geoapify_${place.place_id}`,
    name: place.properties.name || place.properties.formatted || 'Unnamed Place',
    latitude: place.geometry.coordinates[1],
    longitude: place.geometry.coordinates[0],
    category: place.properties.categories[0] || 'unknown',
    isVisible: true,
    createdAt: new Date().toISOString(),
    source: 'geoapify',
    address: place.properties.formatted,
    placeId: place.place_id,
  };
}

// Calculate bounding box from center point and radius
function calculateBounds(latitude: number, longitude: number, radiusMeters: number) {
  const earthRadius = 6371000; // Earth's radius in meters
  const latDelta = (radiusMeters / earthRadius) * (180 / Math.PI);
  const lonDelta = (radiusMeters / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180);

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLon: longitude - lonDelta,
    maxLon: longitude + lonDelta,
  };
}

export class GeoApifyService {
  private static baseUrl = API_CONFIG.GEOAPIFY.BASE_URL;
  private static apiKey = API_CONFIG.GEOAPIFY.API_KEY;

  /**
   * Fetch POIs from GeoAPIfy around a specific location
   */
  static async fetchPoisNearLocation(options: FetchPoisOptions): Promise<PointOfInterest[]> {
    try {
      const { latitude, longitude, radius, categories, limit = API_CONFIG.GEOAPIFY.MAX_RESULTS } = options;
      
      // Calculate bounding box
      const bounds = calculateBounds(latitude, longitude, radius);
      
      // Fetch POIs for each category (GeoAPIfy works better with single categories)
      const allPois: PointOfInterest[] = [];
      
      console.log(`🔍 Starting POI fetch for location: ${latitude}, ${longitude} (radius: ${radius}m)`);
      console.log(`📦 Categories to fetch: ${categories.join(', ')}`);
      
      for (const category of categories) {
        try {
          const url = buildGeoApifyUrl(category, bounds, Math.min(limit, 20)); // Limit per category
          
          console.log(`🌐 Fetching POIs for category: ${category}`);
          console.log(`🔗 API URL: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: GeoApifyResponse = await response.json();
          
          console.log(`📋 Raw API Response for ${category}:`, JSON.stringify(data, null, 2));
          
          if (data.features && Array.isArray(data.features)) {
            const poisForCategory = data.features.map(convertGeoApifyToPoi);
            console.log(`✅ Found ${data.features.length} POIs for category ${category}:`);
            
            // Print each POI found
            poisForCategory.forEach((poi, index) => {
              console.log(`  ${index + 1}. ${poi.name} (${poi.category})`);
              console.log(`     📍 Location: ${poi.latitude}, ${poi.longitude}`);
              if (poi.address) console.log(`     🏠 Address: ${poi.address}`);
              console.log(`     🆔 ID: ${poi.id}`);
            });
            
            allPois.push(...poisForCategory);
          } else {
            console.log(`❌ No POIs found for category ${category}`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching category ${category}:`, error);
          // Continue with other categories even if one fails
        }
      }

      // Remove duplicates based on place_id
      const uniquePois = allPois.filter((poi, index, self) =>
        index === self.findIndex(p => p.placeId === poi.placeId)
      );

      console.log(`🎯 FINAL RESULTS: Fetched ${uniquePois.length} unique POIs from GeoAPIfy`);
      console.log(`📊 Summary by category:`);
      
      // Group by category for summary
      const categoryStats = uniquePois.reduce((acc, poi) => {
        acc[poi.category] = (acc[poi.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`   - ${category}: ${count} POIs`);
      });
      
      return uniquePois;

    } catch (error) {
      console.error('Error fetching POIs from GeoAPIfy:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      // Test with a simple request around a known location (Munich)
      const testOptions: FetchPoisOptions = {
        latitude: 48.1351,
        longitude: 11.5820,
        radius: 1000,
        categories: ['commercial.supermarket'],
        limit: 1,
      };

      const pois = await this.fetchPoisNearLocation(testOptions);
      return Array.isArray(pois);
    } catch (error) {
      console.error('GeoAPIfy connection test failed:', error);
      return false;
    }
  }

  /**
   * Get available categories for POI search
   */
  static getAvailableCategories(): Record<string, string> {
    return API_CONFIG.GEOAPIFY.CATEGORIES;
  }

  /**
   * Get supported category values as array
   */
  static getSupportedCategoryValues(): string[] {
    return Object.values(API_CONFIG.GEOAPIFY.CATEGORIES);
  }
}