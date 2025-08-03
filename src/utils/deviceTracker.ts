export interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  batteryLevel?: number;
  isCharging?: boolean;
  connectionType: string;
  appSource: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export class DeviceTracker {
  private deviceId: string;
  private locationWatcher: number | null = null;

  constructor() {
    this.deviceId = this.generateDeviceId();
  }

  private generateDeviceId(): string {
    // Create unique device identifier
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = canvas.toDataURL();
    const userAgent = navigator.userAgent;
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const combined = `${fingerprint}-${userAgent}-${screenRes}-${timezone}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `device_${Math.abs(hash).toString(36)}`;
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    const deviceInfo: DeviceInfo = {
      id: this.deviceId,
      name: this.getDeviceName(),
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      connectionType: connection?.effectiveType || 'unknown',
      appSource: this.getAppSource()
    };

    // Get battery info if available
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        deviceInfo.batteryLevel = Math.round(battery.level * 100);
        deviceInfo.isCharging = battery.charging;
      } catch (error) {
        console.log('Battery API not available');
      }
    }

    return deviceInfo;
  }

  private getDeviceName(): string {
    const userAgent = navigator.userAgent;
    
    if (/iPhone/.test(userAgent)) return 'iPhone';
    if (/iPad/.test(userAgent)) return 'iPad';
    if (/Android/.test(userAgent)) {
      const match = userAgent.match(/Android.*?;\s*([^)]+)/);
      return match ? match[1].trim() : 'Android Device';
    }
    if (/Windows/.test(userAgent)) return 'Windows PC';
    if (/Mac/.test(userAgent)) return 'Mac';
    if (/Linux/.test(userAgent)) return 'Linux PC';
    
    return 'Unknown Device';
  }

  private getAppSource(): string {
    const hostname = window.location.hostname;
    const userAgent = navigator.userAgent;
    
    // Check if running in different app contexts
    if (hostname === 'system.geotrack.com.np') return 'GeoTrack Web App';
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'Development';
    if (userAgent.includes('Instagram')) return 'Instagram WebView';
    if (userAgent.includes('FBAN')) return 'Facebook WebView';
    if (userAgent.includes('WhatsApp')) return 'WhatsApp WebView';
    if (userAgent.includes('Telegram')) return 'Telegram WebView';
    if ((window.navigator as any).standalone) return 'PWA Standalone';
    
    return `Web Browser - ${hostname}`;
  }

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  startLocationTracking(callback: (location: LocationData) => void, interval: number = 30000): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    // Stop existing watcher
    this.stopLocationTracking();

    // Start watching position
    this.locationWatcher = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          timestamp: position.timestamp
        });
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: interval
      }
    );
  }

  stopLocationTracking(): void {
    if (this.locationWatcher !== null) {
      navigator.geolocation.clearWatch(this.locationWatcher);
      this.locationWatcher = null;
    }
  }

  getDeviceId(): string {
    return this.deviceId;
  }
}

// Singleton instance
export const deviceTracker = new DeviceTracker();