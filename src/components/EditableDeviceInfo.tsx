import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X } from "lucide-react";

interface EditableDeviceInfoProps {
  deviceId: string;
  deviceName: string;
  onDeviceInfoUpdate: (newId: string, newName: string) => void;
}

export function EditableDeviceInfo({ deviceId, deviceName, onDeviceInfoUpdate }: EditableDeviceInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(deviceId);
  const [editingName, setEditingName] = useState(deviceName);
  const { toast } = useToast();

  const handleSave = () => {
    if (!editingId.trim() || !editingName.trim()) {
      toast({
        title: "Error",
        description: "Device ID and Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    onDeviceInfoUpdate(editingId.trim(), editingName.trim());
    setIsEditing(false);
    
    toast({
      title: "Device Info Updated",
      description: "Device ID and name have been updated successfully",
    });
  };

  const handleCancel = () => {
    setEditingId(deviceId);
    setEditingName(deviceName);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Device Identity
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isEditing ? (
          <>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Device ID</Label>
              <Badge variant="outline" className="font-mono text-xs p-2 w-full justify-start">
                {deviceId}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Device Name</Label>
              <div className="text-sm font-medium p-2 border rounded">
                {deviceName}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="device-id">Device ID</Label>
              <Input
                id="device-id"
                value={editingId}
                onChange={(e) => setEditingId(e.target.value)}
                placeholder="Enter device ID"
                className="font-mono text-xs"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-name">Device Name</Label>
              <Input
                id="device-name"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Enter device name"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}