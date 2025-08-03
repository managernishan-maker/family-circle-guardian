import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FamilyMember } from "@/components/FamilyMember";
import { MapView } from "@/components/MapView";
import { SOSButton } from "@/components/SOSButton";
import { DeviceStatus } from "@/components/DeviceStatus";
import { GeofenceCard } from "@/components/GeofenceCard";
import { useMockData } from "@/hooks/useMockData";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MapPin, 
  Shield, 
  Settings, 
  Bell, 
  BatteryLow,
  AlertTriangle,
  Clock,
  Plus
} from "lucide-react";

const Index = () => {
  const { familyMembers, geofences, alerts } = useMockData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleCall = (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    toast({
      title: "Calling...",
      description: `Calling ${member?.name} at ${member?.phone}`,
    });
  };

  const handleLocate = (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    toast({
      title: "Location Request Sent",
      description: `Requesting current location from ${member?.name}`,
    });
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;
  const onlineMembers = familyMembers.filter(m => m.status === "online").length;
  const sosAlerts = familyMembers.filter(m => m.status === "sos").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Family Circle</h1>
            <p className="text-muted-foreground">Keep your family safe and connected</p>
          </div>
          <div className="flex items-center space-x-4">
            {sosAlerts > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {sosAlerts} SOS Alert{sosAlerts > 1 ? 's' : ''}
              </Badge>
            )}
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
              {unreadAlerts > 0 && (
                <Badge variant="destructive" className="ml-1 px-1 text-xs">
                  {unreadAlerts}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="geofences">Geofences</TabsTrigger>
            <TabsTrigger value="device">Device</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Family Members</p>
                      <p className="text-2xl font-bold">{familyMembers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Online</p>
                      <p className="text-2xl font-bold">{onlineMembers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Geofences</p>
                      <p className="text-2xl font-bold">{geofences.filter(g => g.isActive).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Alerts</p>
                      <p className="text-2xl font-bold">{unreadAlerts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Alerts */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Recent Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${!alert.isRead ? 'bg-muted/50' : ''}`}>
                          <div className="flex-shrink-0">
                            {alert.type === "sos" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                            {alert.type === "geofence" && <MapPin className="h-5 w-5 text-blue-500" />}
                            {alert.type === "battery" && <BatteryLow className="h-5 w-5 text-orange-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {alert.timestamp}
                            </div>
                          </div>
                          {!alert.isRead && (
                            <Badge variant="default" className="px-2 py-1 text-xs">New</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SOS Button */}
              <div>
                <SOSButton />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="family" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Family Members</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {familyMembers.map((member) => (
                <FamilyMember
                  key={member.id}
                  member={member}
                  onCall={() => handleCall(member.id)}
                  onLocate={() => handleLocate(member.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Family Map</h2>
              <Button variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Center on Me
              </Button>
            </div>
            
            <MapView familyMembers={familyMembers} />
          </TabsContent>

          <TabsContent value="geofences" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Geofences</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Geofence
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {geofences.map((geofence) => (
                <GeofenceCard
                  key={geofence.id}
                  geofence={geofence}
                  onEdit={() => toast({ title: "Edit Geofence", description: "Opening geofence editor..." })}
                  onDelete={() => toast({ title: "Delete Geofence", description: "Geofence deleted successfully." })}
                  onToggle={() => toast({ title: "Geofence Updated", description: `Geofence ${geofence.isActive ? 'deactivated' : 'activated'}.` })}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="device" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Device Tracking</h2>
              <Badge variant="outline">system.geotrack.com.np</Badge>
            </div>
            
            <DeviceStatus />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
