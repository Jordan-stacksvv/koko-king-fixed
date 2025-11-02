import { Restaurant } from "@/data/menuItems";
import { toast } from "sonner";

const GOOGLE_GEOLOCATION_URL = `https://www.googleapis.com/geolocation/v1/geolocate?key=${
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY
}`;

/**
 * Request user location using browser geolocation API.
 */
export const requestUserLocation = async (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      reject(new Error("Geolocation not supported"));
      return;
    }

    toast.info("Requesting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.success("Location detected successfully!");
        resolve(position);
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        toast.error(errorMessage);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Get the most accurate possible user location.
 * Tries Google Geolocation API first, then falls back to browser geolocation.
 */
export const getAccurateLocation = async (): Promise<{
  coords: { latitude: number; longitude: number };
}> => {
  try {
    // --- Try Google Geolocation API (WiFi + cell tower precision) ---
    const response = await fetch(GOOGLE_GEOLOCATION_URL, { method: "POST" });

    if (response.ok) {
      const data = await response.json();
      return {
        coords: {
          latitude: data.location.lat,
          longitude: data.location.lng,
        },
      };
    }

    // --- Fallback to browser geolocation ---
    return await new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        }
      );
    });
  } catch (error) {
    console.error("Error retrieving location:", error);
    throw new Error("Unable to retrieve location");
  }
};

/**
 * Calculate distance between two coordinates (in km) using the Haversine formula.
 */
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
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Find the nearest restaurant from a list of restaurants.
 */
export const findNearestRestaurant = (
  userLat: number,
  userLng: number,
  restaurants: Restaurant[]
): Restaurant => {
  let nearest = restaurants[0];
  let minDistance = calculateDistance(
    userLat,
    userLng,
    nearest.coordinates.lat,
    nearest.coordinates.lng
  );

  for (const restaurant of restaurants) {
    const distance = calculateDistance(
      userLat,
      userLng,
      restaurant.coordinates.lat,
      restaurant.coordinates.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = restaurant;
    }
  }

  return nearest;
};
