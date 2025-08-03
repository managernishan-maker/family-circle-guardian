import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Users } from "lucide-react";

interface MapViewProps {
  familyMembers: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: "online" | "offline" | "sos";
  }>;
}

export function MapView({ familyMembers }: MapViewProps) {
  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Family Map
          </CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Navigation className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-muted rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
          {/* Simulated map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100" />
          
          {/* Family member markers */}
          {familyMembers.map((member, index) => (
            <div
              key={member.id}
              className="absolute"
              style={{
                left: `${20 + (index * 15)}%`,
                top: `${30 + (index * 10)}%`,
              }}
            >
              <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold ${
                member.status === "sos" ? "bg-red-500" : 
                member.status === "online" ? "bg-green-500" : "bg-gray-500"
              }`}>
                {member.name.charAt(0)}
              </div>
              <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                {member.name}
              </div>
            </div>
          ))}
          
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Interactive map will be integrated here</p>
            <p className="text-xs">Family member locations shown as colored pins</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}