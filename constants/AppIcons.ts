// Common Ionicons used throughout the GeoWhisper app
// You can explore more icons at: https://icons.expo.fyi/

export const AppIcons = {
  // Navigation & UI
  home: 'home',
  homeOutline: 'home-outline',
  list: 'list',
  listOutline: 'list-outline',
  settings: 'settings',
  settingsOutline: 'settings-outline',
  information: 'information-circle',
  informationOutline: 'information-circle-outline',
  close: 'close',
  checkmark: 'checkmark',
  
  // Map & Location
  map: 'map',
  mapOutline: 'map-outline',
  location: 'location',
  locationOutline: 'location-outline',
  locate: 'locate',
  locateOutline: 'locate-outline',
  compass: 'compass',
  compassOutline: 'compass-outline',
  globe: 'globe',
  globeOutline: 'globe-outline',
  layers: 'layers',
  layersOutline: 'layers-outline',
  
  // POI Categories
  restaurant: 'restaurant',
  restaurantOutline: 'restaurant-outline',
  cafe: 'cafe',
  cafeOutline: 'cafe-outline',
  business: 'business',
  businessOutline: 'business-outline',
  school: 'school',
  schoolOutline: 'school-outline',
  hospital: 'medical',
  hospitalOutline: 'medical-outline',
  car: 'car',
  carOutline: 'car-outline',
  train: 'train',
  trainOutline: 'train-outline',
  airplane: 'airplane',
  airplaneOutline: 'airplane-outline',
  
  // Actions
  add: 'add',
  addOutline: 'add-outline',
  remove: 'remove',
  removeOutline: 'remove-outline',
  edit: 'create',
  editOutline: 'create-outline',
  delete: 'trash',
  deleteOutline: 'trash-outline',
  save: 'save',
  saveOutline: 'save-outline',
  search: 'search',
  searchOutline: 'search-outline',
  filter: 'filter',
  filterOutline: 'filter-outline',
  
  // Status & Feedback
  eyeOn: 'eye',
  eyeOff: 'eye-off',
  eyeOnOutline: 'eye-outline',
  eyeOffOutline: 'eye-off-outline',
  heart: 'heart',
  heartOutline: 'heart-outline',
  star: 'star',
  starOutline: 'star-outline',
  warning: 'warning',
  warningOutline: 'warning-outline',
  
  // Controls
  play: 'play',
  pause: 'pause',
  stop: 'stop',
  refresh: 'refresh',
  refreshOutline: 'refresh-outline',
  
} as const;

// Type for all available icon names
export type AppIconName = keyof typeof AppIcons;

// Helper function to get icon name with fallback
export const getIcon = (iconName: AppIconName): string => {
  return AppIcons[iconName] || AppIcons.informationOutline;
};

// POI Category to Icon mapping
export const PoiCategoryIcons = {
  restaurant: AppIcons.restaurant,
  cafe: AppIcons.cafe,
  business: AppIcons.business,
  school: AppIcons.school,
  hospital: AppIcons.hospital,
  transport: AppIcons.car,
  default: AppIcons.locationOutline,
} as const;

// Get icon for POI category
export const getPoiIcon = (category: string): string => {
  return PoiCategoryIcons[category as keyof typeof PoiCategoryIcons] || PoiCategoryIcons.default;
};