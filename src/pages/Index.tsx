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
    <div className="min-h-screen">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Modern Header with Glass Effect */}
        <div className="glass-card border border-white/20 p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-xl shadow-glow float-animation">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient">Family Circle</h1>
                <p className="text-muted-foreground text-lg">Keep your family safe and connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {sosAlerts > 0 && (
                <Badge variant="destructive" className="animate-glow px-3 py-1 text-sm">
                  {sosAlerts} SOS Alert{sosAlerts > 1 ? 's' : ''}
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="hover-glow relative">
                <Bell className="h-5 w-5" />
                {unreadAlerts > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs animate-glow">
                    {unreadAlerts}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="icon" className="hover-glow">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card border border-white/20 p-1 bg-white/5 backdrop-blur-md">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground hover-glow">Dashboard</TabsTrigger>
            <TabsTrigger value="family" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground hover-glow">Family</TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground hover-glow">Map</TabsTrigger>
            <TabsTrigger value="geofences" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground hover-glow">Geofences</TabsTrigger>
            <TabsTrigger value="device" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground hover-glow">Device</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            {/* Modern Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="glass-card border border-white/20 interactive-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-primary rounded-xl">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Family Members</p>
                      <p className="text-3xl font-bold text-gradient">{familyMembers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border border-white/20 interactive-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-accent rounded-xl">
                      <Shield className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Online</p>
                      <p className="text-3xl font-bold text-accent-gradient">{onlineMembers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border border-white/20 interactive-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-secondary rounded-xl">
                      <MapPin className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Geofences</p>
                      <p className="text-3xl font-bold">{geofences.filter(g => g.isActive).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border border-white/20 interactive-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-primary rounded-xl">
                      <Bell className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Alerts</p>
                      <p className="text-3xl font-bold text-gradient">{unreadAlerts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Alerts */}
              <div className="lg:col-span-2">
                <Card className="glass-card border border-white/20 animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gradient">
                      <Bell className="h-6 w-6 mr-3" />
                      Recent Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="custom-scrollbar max-h-96 overflow-y-auto">
                    <div className="space-y-3">
                      {alerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className={`flex items-center space-x-4 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${!alert.isRead ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/20'}`}>
                          <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-primary">
                            {alert.type === "sos" && <AlertTriangle className="h-5 w-5 text-primary-foreground" />}
                            {alert.type === "geofence" && <MapPin className="h-5 w-5 text-primary-foreground" />}
                            {alert.type === "battery" && <BatteryLow className="h-5 w-5 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {alert.timestamp}
                            </div>
                          </div>
                          {!alert.isRead && (
                            <Badge variant="default" className="px-3 py-1 text-xs animate-glow">New</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SOS Button */}
              <div className="animate-fade-in">
                <SOSButton />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="family" className="space-y-6 animate-fade-in">
            <div className="glass-card border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gradient">Family Members</h2>
                <Button className="btn-gradient hover-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {familyMembers.map((member) => (
                <div key={member.id} className="animate-fade-in">
                  <FamilyMember
                    member={member}
                    onCall={() => handleCall(member.id)}
                    onLocate={() => handleLocate(member.id)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-6 animate-fade-in">
            <div className="glass-card border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gradient">Family Map</h2>
                <Button variant="outline" className="hover-glow">
                  <MapPin className="h-4 w-4 mr-2" />
                  Center on Me
                </Button>
              </div>
            </div>
            
            <div className="glass-card border border-white/20 p-1 rounded-2xl">
              <MapView familyMembers={familyMembers} />
            </div>
          </TabsContent>

          <TabsContent value="geofences" className="space-y-6 animate-fade-in">
            <div className="glass-card border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gradient">Geofences</h2>
                <Button className="btn-gradient hover-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Geofence
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {geofences.map((geofence) => (
                <div key={geofence.id} className="animate-fade-in">
                  <GeofenceCard
                    geofence={geofence}
                    onEdit={() => toast({ title: "Edit Geofence", description: "Opening geofence editor..." })}
                    onDelete={() => toast({ title: "Delete Geofence", description: "Geofence deleted successfully." })}
                    onToggle={() => toast({ title: "Geofence Updated", description: `Geofence ${geofence.isActive ? 'deactivated' : 'activated'}.` })}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="device" className="space-y-6 animate-fade-in">
            <div className="glass-card border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gradient">Device Tracking</h2>
                <Badge variant="outline" className="px-4 py-2 text-sm bg-gradient-accent text-accent-foreground">
                  demo4.traccar.org
                </Badge>
              </div>
            </div>
            
            <DeviceStatus />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
