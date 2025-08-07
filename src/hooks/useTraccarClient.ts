import { useState, useEffect, useCallback, useRef } from 'react';
import { TraccarProtocol, TraccarConfiguration, TraccarPosition, createTraccarPosition } from '@/utils/traccarProtocol';

export type { TraccarConfiguration };

export interface TraccarClientState {
  isConnected: boolean;
  isTracking: boolean;
  isAuthenticated: boolean;
  currentPosition?: GeolocationPosition;
  lastSentPosition?: TraccarPosition;
  error?: string;
  status: 'idle' | 'connecting' | 'tracking' | 'error';
  motionState: 'unknown' | 'moving' | 'stationary' | 'sleeping';
  batteryLevel?: number;
  isCharging?: boolean;
  sentCount: number;
  errorCount: number;
}

const DEFAULT_CONFIG: TraccarConfiguration = {
  serverUrl: 'demo4.traccar.org',
  deviceId: '',
  protocol: 'https',
  port: 443,
  trackingMode: 'time',
  timeInterval: 30,
  distanceThreshold: 50,
  angleThreshold: 30,
  highAccuracy: true,
  stationaryHeartbeat: 300,
  backgroundTracking: true,
  motionDetection: true,
  batchSize: 10,
  retryAttempts: 3,
  offlineMode: true
};

export function useTraccarClient() {
  const [config, setConfig] = useState<TraccarConfiguration>(() => {
    const saved = localStorage.getItem('traccar_config');
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  });

  const [state, setState] = useState<TraccarClientState>({
    isConnected: false,
    isTracking: false,
    isAuthenticated: false,
    status: 'idle',
    motionState: 'unknown',
    sentCount: 0,
    errorCount: 0
  });

  const protocolRef = useRef<TraccarProtocol>();
  const watchIdRef = useRef<number>();
  const trackingIntervalRef = useRef<NodeJS.Timeout>();
  const lastPositionRef = useRef<GeolocationPosition>();
  const motionTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize protocol when config changes
  useEffect(() => {
    protocolRef.current = new TraccarProtocol(config);
    localStorage.setItem('traccar_config', JSON.stringify(config));
  }, [config]);

  // Battery status monitoring
  useEffect(() => {
    const updateBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setState(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging
          }));
        } catch (error) {
          console.warn('Battery API not available');
        }
      }
    };

    updateBatteryStatus();
    const interval = setInterval(updateBatteryStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const authenticate = useCallback(async (username: string, password: string): Promise<boolean> => {
    if (!protocolRef.current) return false;

    setState(prev => ({ ...prev, status: 'connecting' }));

    try {
      const updatedConfig = { ...config, username, password };
      protocolRef.current.updateConfig(updatedConfig);
      setConfig(updatedConfig);

      const success = await protocolRef.current.authenticate();
      
      setState(prev => ({
        ...prev,
        isAuthenticated: success,
        isConnected: success,
        status: success ? 'idle' : 'error',
        error: success ? undefined : 'Authentication failed'
      }));

      if (success) {
        protocolRef.current.connectWebSocket();
      }

      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        isConnected: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Authentication failed'
      }));
      return false;
    }
  }, [config]);

  const updateConfig = useCallback((newConfig: Partial<TraccarConfiguration>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const calculateDistance = (pos1: GeolocationPosition, pos2: GeolocationPosition): number => {
    const R = 6371000; // Earth's radius in meters
    const lat1 = pos1.coords.latitude * Math.PI / 180;
    const lat2 = pos2.coords.latitude * Math.PI / 180;
    const deltaLat = (pos2.coords.latitude - pos1.coords.latitude) * Math.PI / 180;
    const deltaLon = (pos2.coords.longitude - pos1.coords.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const calculateAngleDifference = (pos1: GeolocationPosition, pos2: GeolocationPosition): number => {
    const bearing1 = pos1.coords.heading || 0;
    const bearing2 = pos2.coords.heading || 0;
    let diff = Math.abs(bearing2 - bearing1);
    return Math.min(diff, 360 - diff);
  };

  const shouldSendPosition = useCallback((position: GeolocationPosition): boolean => {
    if (!lastPositionRef.current) return true;

    const lastPos = lastPositionRef.current;
    const timeDiff = position.timestamp - lastPos.timestamp;

    switch (config.trackingMode) {
      case 'time':
        return timeDiff >= config.timeInterval * 1000;
      
      case 'distance':
        const distance = calculateDistance(lastPos, position);
        return distance >= config.distanceThreshold;
      
      case 'angle':
        const angleDiff = calculateAngleDifference(lastPos, position);
        return angleDiff >= config.angleThreshold;
      
      case 'hybrid':
        const timeCondition = timeDiff >= config.timeInterval * 1000;
        const distanceCondition = calculateDistance(lastPos, position) >= config.distanceThreshold;
        const angleCondition = calculateAngleDifference(lastPos, position) >= config.angleThreshold;
        return timeCondition || distanceCondition || angleCondition;
      
      default:
        return true;
    }
  }, [config]);

  const detectMotion = useCallback((position: GeolocationPosition) => {
    const speed = position.coords.speed || 0;
    const isMoving = speed > 0.5; // 0.5 m/s threshold

    if (isMoving) {
      setState(prev => ({ ...prev, motionState: 'moving' }));
      if (motionTimeoutRef.current) {
        clearTimeout(motionTimeoutRef.current);
      }
    } else {
      // Set timeout to transition to stationary after being still
      if (motionTimeoutRef.current) {
        clearTimeout(motionTimeoutRef.current);
      }
      
      motionTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, motionState: 'stationary' }));
        
        // Transition to sleeping mode after longer stationary period
        motionTimeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, motionState: 'sleeping' }));
        }, config.stationaryHeartbeat * 1000);
      }, 30000); // 30 seconds to become stationary
    }
  }, [config.stationaryHeartbeat]);

  const sendCurrentPosition = useCallback(async (position: GeolocationPosition) => {
    if (!protocolRef.current || !state.isAuthenticated) return;

    try {
      const traccarPosition = createTraccarPosition(
        config.deviceId,
        position.coords.latitude,
        position.coords.longitude,
        position.coords.accuracy,
        position.coords.speed ? position.coords.speed * 3.6 : 0, // Convert m/s to km/h
        position.coords.heading || 0,
        position.coords.altitude || 0,
        {
          batteryLevel: state.batteryLevel,
          charge: state.isCharging,
          motion: state.motionState === 'moving',
          accuracy: position.coords.accuracy
        }
      );

      const success = await protocolRef.current.sendPosition(traccarPosition);
      
      setState(prev => ({
        ...prev,
        lastSentPosition: traccarPosition,
        sentCount: success ? prev.sentCount + 1 : prev.sentCount,
        errorCount: success ? prev.errorCount : prev.errorCount + 1,
        error: success ? undefined : 'Failed to send position'
      }));

      if (success) {
        lastPositionRef.current = position;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [config.deviceId, state.isAuthenticated, state.batteryLevel, state.isCharging, state.motionState]);

  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    setState(prev => ({ ...prev, currentPosition: position }));
    
    if (config.motionDetection) {
      detectMotion(position);
    }

    if (shouldSendPosition(position)) {
      sendCurrentPosition(position);
    }
  }, [config.motionDetection, detectMotion, shouldSendPosition, sendCurrentPosition]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation || !state.isAuthenticated) return;

    setState(prev => ({ ...prev, isTracking: true, status: 'tracking', error: undefined }));

    const options: PositionOptions = {
      enableHighAccuracy: config.highAccuracy,
      timeout: 15000,
      maximumAge: 5000
    };

    // Start continuous position watching
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (error) => {
        setState(prev => ({
          ...prev,
          error: `Geolocation error: ${error.message}`,
          errorCount: prev.errorCount + 1
        }));
      },
      options
    );

    // Set up heartbeat for stationary mode
    if (config.stationaryHeartbeat > 0) {
      trackingIntervalRef.current = setInterval(() => {
        if (state.motionState === 'stationary' || state.motionState === 'sleeping') {
          navigator.geolocation.getCurrentPosition(
            handlePositionUpdate,
            (error) => console.warn('Heartbeat position error:', error),
            options
          );
        }
      }, config.stationaryHeartbeat * 1000);
    }
  }, [state.isAuthenticated, config, handlePositionUpdate, state.motionState]);

  const stopTracking = useCallback(() => {
    setState(prev => ({ ...prev, isTracking: false, status: 'idle' }));

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = undefined;
    }

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = undefined;
    }

    if (motionTimeoutRef.current) {
      clearTimeout(motionTimeoutRef.current);
      motionTimeoutRef.current = undefined;
    }
  }, []);

  const disconnect = useCallback(() => {
    stopTracking();
    if (protocolRef.current) {
      protocolRef.current.disconnect();
    }
    setState(prev => ({
      ...prev,
      isConnected: false,
      isAuthenticated: false,
      status: 'idle'
    }));
  }, [stopTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      disconnect();
    };
  }, [stopTracking, disconnect]);

  return {
    config,
    state,
    updateConfig,
    authenticate,
    startTracking,
    stopTracking,
    disconnect,
    sendCurrentPosition: () => {
      if (state.currentPosition) {
        sendCurrentPosition(state.currentPosition);
      }
    }
  };
}