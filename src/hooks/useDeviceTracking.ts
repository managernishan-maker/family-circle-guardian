import { useState, useEffect } from "react";
import { deviceTracker, DeviceInfo, LocationData } from "@/utils/deviceTracker";

export function useDeviceTracking() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    // Load device info on mount
    loadDeviceInfo();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const info = await deviceTracker.getDeviceInfo();
      setDeviceInfo(info);
    } catch (error) {
      console.error('Failed to load device info:', error);
      setTrackingError('Failed to load device information');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setTrackingError(null);
      const location = await deviceTracker.getCurrentLocation();
      setCurrentLocation(location);
      return location;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      setTrackingError(errorMessage);
      throw error;
    }
  };

  const startTracking = (interval: number = 30000) => {
    try {
      setTrackingError(null);
      setIsTracking(true);
      
      deviceTracker.startLocationTracking((location) => {
        setCurrentLocation(location);
        // Here you would send data to your backend
        sendTrackingData(location);
      }, interval);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start tracking';
      setTrackingError(errorMessage);
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    deviceTracker.stopLocationTracking();
    setIsTracking(false);
  };

  const sendTrackingData = async (location: LocationData) => {
    if (!deviceInfo) return;

    const trackingData = {
      deviceId: deviceInfo.id,
      deviceInfo,
      location,
      timestamp: new Date().toISOString()
    };

    // TODO: Replace with your backend API endpoint
    try {
      console.log('Tracking data to send to backend:', trackingData);
      
      // Example API call (uncomment when backend is ready):
      // await fetch('https://api.system.geotrack.com.np/track', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(trackingData)
      // });
      
    } catch (error) {
      console.error('Failed to send tracking data:', error);
    }
  };

  const refreshDeviceInfo = () => {
    loadDeviceInfo();
  };

  return {
    deviceInfo,
    currentLocation,
    isTracking,
    trackingError,
    getCurrentLocation,
    startTracking,
    stopTracking,
    refreshDeviceInfo,
    deviceId: deviceInfo?.id
  };
}