export interface TraccarDevice {
  id: string;
  name: string;
  uniqueId: string;
  status: 'online' | 'offline' | 'unknown';
  lastUpdate?: Date;
  positionId?: number;
}

export interface TraccarPosition {
  id?: number;
  deviceId: string;
  protocol: string;
  deviceTime: string;
  fixTime: string;
  serverTime?: string;
  outdated: boolean;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number; // km/h
  course: number; // degrees
  address?: string;
  accuracy?: number;
  network?: any;
  attributes: {
    [key: string]: any;
    batteryLevel?: number;
    charge?: boolean;
    ignition?: boolean;
    motion?: boolean;
    distance?: number;
    totalDistance?: number;
    hours?: number;
  };
}

export interface TraccarConfiguration {
  serverUrl: string;
  deviceId: string;
  deviceName?: string;
  protocol: 'http' | 'https';
  port: number;
  
  // Tracking modes
  trackingMode: 'time' | 'distance' | 'angle' | 'hybrid';
  timeInterval: number; // seconds
  distanceThreshold: number; // meters
  angleThreshold: number; // degrees
  
  // Accuracy and power settings
  highAccuracy: boolean;
  stationaryHeartbeat: number; // seconds
  backgroundTracking: boolean;
  motionDetection: boolean;
  
  // Authentication
  username?: string;
  password?: string;
  token?: string;
  
  // Advanced settings
  batchSize: number;
  retryAttempts: number;
  offlineMode: boolean;
}

export interface TraccarEvent {
  id?: number;
  type: string;
  eventTime: string;
  deviceId: string;
  positionId?: number;
  geofenceId?: number;
  attributes?: any;
}

export class TraccarProtocol {
  private config: TraccarConfiguration;
  private authToken?: string;
  private websocket?: WebSocket;
  private retryCount = 0;
  private offlineQueue: TraccarPosition[] = [];

  constructor(config: TraccarConfiguration) {
    this.config = config;
  }

  async authenticate(): Promise<boolean> {
    if (!this.config.username || !this.config.password) {
      throw new Error('Username and password required for authentication');
    }

    try {
      const response = await fetch(`${this.getBaseUrl()}/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(this.config.username)}&password=${encodeURIComponent(this.config.password)}`,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.authToken = data.token;
        localStorage.setItem('traccar_token', this.authToken || '');
        return true;
      } else {
        throw new Error(`Authentication failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  async sendPosition(position: TraccarPosition): Promise<boolean> {
    const url = `${this.getBaseUrl()}/api/positions`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        },
        body: JSON.stringify(position),
        credentials: 'include'
      });

      if (response.ok) {
        this.retryCount = 0;
        this.processOfflineQueue();
        return true;
      } else {
        throw new Error(`Failed to send position: ${response.status}`);
      }
    } catch (error) {
      console.error('Send position error:', error);
      
      if (this.config.offlineMode) {
        this.offlineQueue.push(position);
        if (this.offlineQueue.length > 1000) {
          this.offlineQueue = this.offlineQueue.slice(-1000);
        }
      }
      
      return false;
    }
  }

  async sendBatchPositions(positions: TraccarPosition[]): Promise<boolean> {
    const url = `${this.getBaseUrl()}/api/positions`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        },
        body: JSON.stringify(positions),
        credentials: 'include'
      });

      return response.ok;
    } catch (error) {
      console.error('Send batch positions error:', error);
      return false;
    }
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    const batch = this.offlineQueue.splice(0, this.config.batchSize);
    const success = await this.sendBatchPositions(batch);
    
    if (!success && this.retryCount < this.config.retryAttempts) {
      this.offlineQueue.unshift(...batch);
      this.retryCount++;
    }
  }

  connectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
    }

    const wsUrl = this.getBaseUrl().replace(/^http/, 'ws') + '/api/socket';
    this.websocket = new WebSocket(wsUrl);

    this.websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.websocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  private handleWebSocketMessage(data: any): void {
    // Handle real-time updates from server
    switch (data.type) {
      case 'position':
        // Handle position updates
        break;
      case 'device':
        // Handle device status updates
        break;
      case 'event':
        // Handle events
        break;
    }
  }

  private getBaseUrl(): string {
    return `${this.config.protocol}://${this.config.serverUrl}:${this.config.port}`;
  }

  updateConfig(config: Partial<TraccarConfiguration>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): TraccarConfiguration {
    return { ...this.config };
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = undefined;
    }
  }
}

export function createTraccarPosition(
  deviceId: string,
  latitude: number,
  longitude: number,
  accuracy?: number,
  speed?: number,
  course?: number,
  altitude?: number,
  attributes?: any
): TraccarPosition {
  const now = new Date().toISOString();
  
  return {
    deviceId,
    protocol: 'web',
    deviceTime: now,
    fixTime: now,
    outdated: false,
    valid: true,
    latitude,
    longitude,
    altitude: altitude || 0,
    speed: speed || 0,
    course: course || 0,
    accuracy,
    attributes: {
      ...attributes,
      ip: window.location.hostname,
      userAgent: navigator.userAgent
    }
  };
}