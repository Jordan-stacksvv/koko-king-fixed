import { useEffect, useState, useCallback } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LiveTrackingMapProps {
  orderId: string;
  driverLocation?: { lat: number; lng: number };
  customerLocation?: { lat: number; lng: number };
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px"
};

const defaultCenter = {
  lat: 5.6037,
  lng: -0.1870 // Accra, Ghana
};

// IMPORTANT: Replace with your own Google Maps API Key
// Get one from: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";

const LiveTrackingMap = ({ orderId, driverLocation, customerLocation }: LiveTrackingMapProps) => {
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (driverLocation && customerLocation) {
      // Calculate center point between driver and customer
      const centerLat = (driverLocation.lat + customerLocation.lat) / 2;
      const centerLng = (driverLocation.lng + customerLocation.lng) / 2;
      setCenter({ lat: centerLat, lng: centerLng });
      setZoom(14);
    } else if (driverLocation) {
      setCenter(driverLocation);
    } else if (customerLocation) {
      setCenter(customerLocation);
    }
  }, [driverLocation, customerLocation]);

  // Check if API key is configured
  if (GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Google Maps API Key Required</p>
              <p className="text-sm mb-2">
                To enable live driver tracking with maps, you need to add your Google Maps API key.
              </p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Visit <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                <li>Enable Maps JavaScript API</li>
                <li>Create an API key and restrict it to your domain</li>
                <li>Add the key to <code className="bg-muted px-1 py-0.5 rounded">src/components/LiveTrackingMap.tsx</code></li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Live Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {/* Driver Location Marker */}
            {driverLocation && (
              <Marker
                position={driverLocation}
                icon={{
                  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%234CAF50' stroke='white' stroke-width='2'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/%3E%3Cpath d='M12 8v8m-4-4h8' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E",
                  scaledSize: new google.maps.Size(40, 40),
                  anchor: new google.maps.Point(20, 40),
                }}
                title="Driver Location"
                animation={google.maps.Animation.BOUNCE}
              />
            )}

            {/* Customer Location Marker */}
            {customerLocation && (
              <Marker
                position={customerLocation}
                icon={{
                  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23FF5722' stroke='white' stroke-width='2'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3' fill='white'/%3E%3C/svg%3E",
                  scaledSize: new google.maps.Size(40, 40),
                  anchor: new google.maps.Point(20, 40),
                }}
                title="Delivery Location"
              />
            )}

            {/* Route Line */}
            {driverLocation && customerLocation && (
              <Polyline
                path={[driverLocation, customerLocation]}
                options={{
                  strokeColor: "#2196F3",
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  geodesic: true,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>Driver Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
            <span>Delivery Address</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTrackingMap;
