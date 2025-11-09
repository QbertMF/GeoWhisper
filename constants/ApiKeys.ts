// API Configuration for GeoWhisper app
// Supported GeoAPIfy categories: heritage, natural, tourism.attraction, tourism.attraction.artwork, tourism, building, memorial
export const API_CONFIG = {
  GEOAPIFY: {
    BASE_URL: 'https://api.geoapify.com/v2',
    API_KEY: 'c28d033aa1d24dac948457f347fe678b',
    ENDPOINTS: {
      PLACES: '/places',
    },
    CATEGORIES: {
      HERITAGE: 'heritage',
      NATURAL: 'natural',
      TOURISM_ATTRACTION: 'tourism.attraction',
      TOURISM_ARTWORK: 'tourism.attraction.artwork',
      TOURISM: 'tourism',
      BUILDING: 'building',
      MEMORIAL: 'memorial',
    },
    MAX_RESULTS: 50,
  }
};

// Helper function to build GeoAPIfy URL
export function buildGeoApifyUrl(
  category: string,
  bounds: {
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
  },
  limit: number = API_CONFIG.GEOAPIFY.MAX_RESULTS
): string {
  const { BASE_URL, API_KEY, ENDPOINTS } = API_CONFIG.GEOAPIFY;
  const rect = `${bounds.minLon},${bounds.minLat},${bounds.maxLon},${bounds.maxLat}`;
  
  return `${BASE_URL}${ENDPOINTS.PLACES}?categories=${category}&filter=rect%3A${rect}&limit=${limit}&apiKey=${API_KEY}`;
}