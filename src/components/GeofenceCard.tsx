import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Settings, Trash2 } from "lucide-react";

interface GeofenceCardProps {
  geofence: {
    id: string;
    name: string;
    address: string;
    type: "home" | "school" | "work" | "custom";
    radius: number;
    isActive: boolean;
    notifications: boolean;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
}

export function GeofenceCard({ geofence, onEdit, onDelete, onToggle }: GeofenceCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "home": return "bg-blue-500";
      case "school": return "bg-green-500";
      case "work": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "home": return "Home";
      case "school": return "School";
      case "work": return "Work";
      default: return "Custom";
    }
  };

  return (
    <Card className={`transition-all ${geofence.isActive ? "border-primary" : "border-muted"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${getTypeColor(geofence.type)}`} />
            {geofence.name}
          </CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Settings className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm text-muted-foreground">{geofence.address}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{getTypeName(geofence.type)}</Badge>
              <span className="text-xs text-muted-foreground">
                {geofence.radius}m radius
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={geofence.isActive ? "default" : "secondary"}>
                {geofence.isActive ? "Active" : "Inactive"}
              </Badge>
              {geofence.notifications && (
                <Badge variant="outline" className="text-xs">
                  Alerts On
                </Badge>
              )}
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
            onClick={onToggle}
          >
            {geofence.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}