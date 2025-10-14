import { Restaurant } from "@/data/menuItems";

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find the nearest restaurant to user's location
export const findNearestRestaurant = (
  userLat: number,
  userLng: number,
  restaurants: Restaurant[]
): Restaurant => {
  let nearest = restaurants[0];
  let minDistance = calculateDistance(userLat, userLng, nearest.coordinates.lat, nearest.coordinates.lng);

  restaurants.forEach((restaurant) => {
    const distance = calculateDistance(userLat, userLng, restaurant.coordinates.lat, restaurant.coordinates.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = restaurant;
    }
  });

  return nearest;
};

// Request user's geolocation
export const requestUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  });
};
