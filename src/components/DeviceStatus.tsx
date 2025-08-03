import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeviceTracking } from "@/hooks/useDeviceTracking";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  Battery, 
  MapPin, 
  Wifi, 
  Monitor, 
  Globe, 
  Clock,
  Zap,
  RefreshCw,
  Play,
  Square
} from "lucide-react";

export function DeviceStatus() {
  const { 
    deviceInfo, 
    currentLocation, 
    isTracking, 
    trackingError,
    getCurrentLocation,
    startTracking,
    stopTracking,
    refreshDeviceInfo
  } = useDeviceTracking();
  
  const { toast } = useToast();

  const handleGetLocation = async () => {
    try {
      await getCurrentLocation();
      toast({
        title: "Location Updated",
        description: "Current location has been retrieved successfully.",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Failed to get current location. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleStartTracking = () => {
    startTracking(30000); // Update every 30 seconds
    toast({
      title: "Tracking Started",
      description: "Device location tracking is now active.",
    });
  };

  const handleStopTracking = () => {
    stopTracking();
    toast({
      title: "Tracking Stopped", 
      description: "Device location tracking has been stopped.",
    });
  };

  if (!deviceInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading device information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Device Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Device Information
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshDeviceInfo}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Device ID:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {deviceInfo.id}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">{deviceInfo.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Platform:</span>
                <span className="text-sm">{deviceInfo.platform}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <Monitor className="h-3 w-3 inline mr-1" />
                  Screen:
                </span>
                <span className="text-sm">{deviceInfo.screenResolution}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <Globe className="h-3 w-3 inline mr-1" />
                  Language:
                </span>
                <span className="text-sm">{deviceInfo.language}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Timezone:
                </span>
                <span className="text-sm">{deviceInfo.timezone}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <Wifi className="h-3 w-3 inline mr-1" />
                  Connection:
                </span>
                <Badge variant="secondary">{deviceInfo.connectionType}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">App Source:</span>
                <Badge variant="default">{deviceInfo.appSource}</Badge>
              </div>
            </div>
          </div>
          
          {/* Battery Information */}
          {(deviceInfo.batteryLevel !== undefined || deviceInfo.isCharging !== undefined) && (
            <div className="border-t pt-4">
              <div className="flex items-center space-x-4">
                <Battery className={`h-5 w-5 ${deviceInfo.batteryLevel && deviceInfo.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Battery Status</span>
                    <div className="flex items-center space-x-2">
                      {deviceInfo.batteryLevel !== undefined && (
                        <Badge variant={deviceInfo.batteryLevel < 20 ? "destructive" : "secondary"}>
                          {deviceInfo.batteryLevel}%
                        </Badge>
                      )}
                      {deviceInfo.isCharging && (
                        <Badge variant="default" className="bg-green-500">
                          <Zap className="h-3 w-3 mr-1" />
                          Charging
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Tracking Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location Tracking
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {trackingError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{trackingError}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tracking Status</p>
              <p className="text-xs text-muted-foreground">
                {isTracking ? 'Location updates every 30 seconds' : 'Location tracking is stopped'}
              </p>
            </div>
            <Badge variant={isTracking ? "default" : "secondary"}>
              {isTracking ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          {currentLocation && (
            <div className="border rounded-md p-3 space-y-2">
              <p className="text-sm font-medium">Current Location</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Lat:</span> {currentLocation.latitude.toFixed(6)}
                </div>
                <div>
                  <span className="text-muted-foreground">Lng:</span> {currentLocation.longitude.toFixed(6)}
                </div>
                <div>
                  <span className="text-muted-foreground">Accuracy:</span> {currentLocation.accuracy}m
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span> {new Date(currentLocation.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={handleGetLocation}>
              <MapPin className="h-4 w-4 mr-2" />
              Get Location
            </Button>
            
            {!isTracking ? (
              <Button size="sm" onClick={handleStartTracking}>
                <Play className="h-4 w-4 mr-2" />
                Start Tracking
              </Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={handleStopTracking}>
                <Square className="h-4 w-4 mr-2" />
                Stop Tracking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}