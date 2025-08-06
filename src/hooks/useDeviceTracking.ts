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
      deviceName: deviceInfo.name,
      deviceInfo,
      location,
      timestamp: new Date().toISOString(),
      domain: 'system.geotrack.com.np'
    };

    try {
      console.log('📍 Sending tracking data to backend:', trackingData);
      
      // Send to your backend endpoint
      const response = await fetch('https://system.geotrack.com.np/yesama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Device ${deviceInfo.id}`,
        },
        body: JSON.stringify(trackingData)
      }).catch(err => {
        console.log('📡 Backend not ready yet - Data logged locally:', err.message);
        // Store data locally for now
        const localData = JSON.parse(localStorage.getItem('geotrack_data') || '[]');
        localData.push(trackingData);
        localStorage.setItem('geotrack_data', JSON.stringify(localData.slice(-100))); // Keep last 100 entries
        return null;
      });
      
      if (response?.ok) {
        console.log('✅ Data sent successfully to backend');
      }
    } catch (error) {
      console.error('❌ Failed to send tracking data:', error);
    }
  };

  const refreshDeviceInfo = async () => {
    await loadDeviceInfo();
  };

  const updateDeviceInfo = (newId: string, newName: string) => {
    deviceTracker.updateDeviceInfo(newId, newName);
    loadDeviceInfo(); // Reload to get updated info
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
    updateDeviceInfo,
    deviceId: deviceInfo?.id,
    deviceName: deviceInfo?.name
  };
}