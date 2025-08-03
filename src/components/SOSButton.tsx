import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Phone, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SOSButton() {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const handleSOSPress = () => {
    setIsPressed(true);
    setCountdown(5);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    setIsPressed(false);
    setCountdown(0);
    toast({
      title: "SOS Cancelled",
      description: "Emergency alert was cancelled.",
    });
  };

  const triggerSOS = () => {
    setIsPressed(false);
    toast({
      title: "SOS Alert Sent!",
      description: "Emergency alert sent to all family members.",
      variant: "destructive",
    });
  };

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-red-700">
          <Shield className="h-5 w-5 mr-2" />
          Emergency SOS
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-center space-y-4">
          {!isPressed ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  variant="destructive" 
                  className="w-32 h-32 rounded-full text-lg font-bold"
                >
                  <div className="flex flex-col items-center">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    SOS
                  </div>
                </Button>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Confirm Emergency Alert
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    This will send an emergency alert to all family members with your current location.
                  </p>
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={handleSOSPress}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Send SOS Alert
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-2xl animate-pulse">
                {countdown}
              </div>
              <p className="text-sm text-red-600 font-medium">
                SOS Alert sending in {countdown} seconds...
              </p>
              <Button variant="outline" onClick={cancelSOS}>
                Cancel
              </Button>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Hold for 5 seconds to send emergency alert
          </p>
        </div>
      </CardContent>
    </Card>
  );
}