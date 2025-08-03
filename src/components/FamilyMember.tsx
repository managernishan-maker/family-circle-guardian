import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Shield } from "lucide-react";

interface FamilyMemberProps {
  member: {
    id: string;
    name: string;
    avatar?: string;
    status: "online" | "offline" | "sos";
    location: string;
    battery: number;
    lastSeen: string;
  };
  onCall?: () => void;
  onLocate?: () => void;
}

export function FamilyMember({ member, onCall, onLocate }: FamilyMemberProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "sos": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online": return "Online";
      case "sos": return "SOS Alert";
      default: return "Offline";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{member.name}</h3>
              <Badge variant={member.status === "sos" ? "destructive" : "secondary"}>
                {getStatusText(member.status)}
              </Badge>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{member.location}</span>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Battery: {member.battery}%</span>
              <span>Last seen: {member.lastSeen}</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button size="sm" variant="outline" onClick={onCall}>
              <Phone className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onLocate}>
              <MapPin className="h-3 w-3" />
            </Button>
            {member.status === "sos" && (
              <Button size="sm" variant="destructive">
                <Shield className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}