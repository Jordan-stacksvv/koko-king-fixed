// GPS Simulation utilities for demo purposes
// In production, this would use actual device GPS

export interface GPSCoordinate {
  lat: number;
  lng: number;
  timestamp: string;
}

// Accra, Ghana - Common locations for simulation
const ACCRA_LOCATIONS = {
  restaurant: { lat: 5.6037, lng: -0.1870 }, // Central Accra
  zone1: { lat: 5.6200, lng: -0.1750 }, // East Legon area
  zone2: { lat: 5.5900, lng: -0.2100 }, // Osu area
  zone3: { lat: 5.6400, lng: -0.1600 }, // Adenta area
  zone4: { lat: 5.5700, lng: -0.1950 }, // Airport area
};

/**
 * Generate a random customer location in Accra
 */
export const generateCustomerLocation = (): GPSCoordinate => {
  const zones = Object.values(ACCRA_LOCATIONS).filter(loc => loc !== ACCRA_LOCATIONS.restaurant);
  const randomZone = zones[Math.floor(Math.random() * zones.length)];
  
  // Add slight random offset
  const lat = randomZone.lat + (Math.random() - 0.5) * 0.01;
  const lng = randomZone.lng + (Math.random() - 0.5) * 0.01;
  
  return {
    lat,
    lng,
    timestamp: new Date().toISOString()
  };
};

/**
 * Initialize driver at restaurant location
 */
export const getRestaurantLocation = (): GPSCoordinate => {
  return {
    ...ACCRA_LOCATIONS.restaurant,
    timestamp: new Date().toISOString()
  };
};

/**
 * Calculate next position moving from current to destination
 * Simulates driver movement along route
 */
export const calculateNextPosition = (
  current: GPSCoordinate,
  destination: GPSCoordinate,
  speedKmh: number = 30 // Average speed in km/h
): GPSCoordinate => {
  const EARTH_RADIUS_KM = 6371;
  
  // Calculate distance
  const dLat = (destination.lat - current.lat) * Math.PI / 180;
  const dLng = (destination.lng - current.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(current.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  // If very close (< 100m), arrive at destination
  if (distance < 0.1) {
    return {
      ...destination,
      timestamp: new Date().toISOString()
    };
  }
  
  // Calculate movement per update (3 seconds)
  const updateIntervalSeconds = 3;
  const distancePerUpdate = (speedKmh * 1000 / 3600) * updateIntervalSeconds / 1000; // in km
  
  // Calculate progress ratio
  const progressRatio = Math.min(distancePerUpdate / distance, 1);
  
  // Linear interpolation
  const newLat = current.lat + (destination.lat - current.lat) * progressRatio;
  const newLng = current.lng + (destination.lng - current.lng) * progressRatio;
  
  return {
    lat: newLat,
    lng: newLng,
    timestamp: new Date().toISOString()
  };
};

/**
 * Calculate estimated time to reach destination
 */
export const calculateETA = (
  current: GPSCoordinate,
  destination: GPSCoordinate,
  speedKmh: number = 30
): number => {
  const EARTH_RADIUS_KM = 6371;
  
  const dLat = (destination.lat - current.lat) * Math.PI / 180;
  const dLng = (destination.lng - current.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(current.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  // Calculate time in minutes
  const timeHours = distance / speedKmh;
  const timeMinutes = Math.ceil(timeHours * 60);
  
  return timeMinutes;
};

/**
 * Store driver location in localStorage
 */
export const updateDriverLocation = (driverId: string, location: GPSCoordinate) => {
  const driverLocations = JSON.parse(localStorage.getItem("driverLocations") || "{}");
  driverLocations[driverId] = location;
  localStorage.setItem("driverLocations", JSON.stringify(driverLocations));
};

/**
 * Get driver's current location
 */
export const getDriverLocation = (driverId: string): GPSCoordinate | null => {
  const driverLocations = JSON.parse(localStorage.getItem("driverLocations") || "{}");
  return driverLocations[driverId] || null;
};

/**
 * Start GPS tracking simulation for a driver
 */
export const startGPSTracking = (
  driverId: string,
  destinationLocation: GPSCoordinate,
  onUpdate?: (location: GPSCoordinate) => void
): NodeJS.Timeout => {
  // Initialize at restaurant
  let currentLocation = getDriverLocation(driverId) || getRestaurantLocation();
  updateDriverLocation(driverId, currentLocation);
  
  const interval = setInterval(() => {
    // Calculate next position
    const nextPosition = calculateNextPosition(currentLocation, destinationLocation);
    currentLocation = nextPosition;
    
    // Update storage
    updateDriverLocation(driverId, nextPosition);
    
    // Callback
    if (onUpdate) {
      onUpdate(nextPosition);
    }
    
    // Stop if arrived (within 100m)
    const distance = calculateETA(nextPosition, destinationLocation, 30);
    if (distance < 1) {
      clearInterval(interval);
    }
  }, 3000); // Update every 3 seconds
  
  return interval;
};

/**
 * Stop GPS tracking for a driver
 */
export const stopGPSTracking = (intervalId: NodeJS.Timeout) => {
  clearInterval(intervalId);
};
