import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLoadGoogleMapsApi } from "@/hooks/useLoadGoogleMapsApi";
import { MapPin } from "lucide-react";

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
  type Provider = 'osm' | 'google';
  const [provider, setProvider] = useState<Provider>('osm');
  const [googleKey, setGoogleKey] = useState('');
  const { ready: googleReady } = useLoadGoogleMapsApi(provider === 'google' ? googleKey : undefined);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkersRef = useRef<L.Marker[]>([]);
  const googleMapRef = useRef<any>(null);
  const googleMarkersRef = useRef<any[]>([]);

  const defaultCenter = { lat: familyMembers[0]?.lat ?? 27.7172, lng: familyMembers[0]?.lng ?? 85.3240 };

  // Cleanup when switching providers
  useEffect(() => {
    if (provider === 'osm') {
      // remove google map
      if (googleMapRef.current && mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
      }
      googleMapRef.current = null;
      googleMarkersRef.current = [];
    } else {
      // remove leaflet map
      leafletMarkersRef.current.forEach(m => m.remove());
      leafletMarkersRef.current = [];
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    }
  }, [provider]);

  // Initialize / update OSM map
  useEffect(() => {
    if (provider !== 'osm' || !mapContainerRef.current) return;

    // init if needed
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapContainerRef.current, { zoomControl: true }).setView([defaultCenter.lat, defaultCenter.lng], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);
    }

    // clear markers
    leafletMarkersRef.current.forEach(m => m.remove());
    leafletMarkersRef.current = [];

    // add markers
    familyMembers.forEach(member => {
      const statusClass =
        member.status === 'sos' ? 'bg-destructive' :
        member.status === 'online' ? 'bg-primary' : 'bg-muted';

      const icon = L.divIcon({
        className: '',
        html: `<div class="w-6 h-6 rounded-full border-2 border-background shadow-md flex items-center justify-center text-primary-foreground text-xs font-bold ${statusClass}">${member.name.charAt(0).toUpperCase()}</div>`
      });

      const marker = L.marker([member.lat, member.lng], { icon }).addTo(leafletMapRef.current!);
      marker.bindTooltip(member.name, { direction: 'top', offset: [0, 8] as any, opacity: 0.9 });
      leafletMarkersRef.current.push(marker);
    });

    // fit bounds
    if (familyMembers.length > 1) {
      const bounds = L.latLngBounds(familyMembers.map(m => [m.lat, m.lng]) as any);
      leafletMapRef.current.fitBounds(bounds, { padding: [24, 24] as any });
    }

  }, [provider, familyMembers]);

  // Initialize / update Google map
  useEffect(() => {
    if (provider !== 'google' || !mapContainerRef.current || !googleKey || !googleReady) return;

    if (!googleMapRef.current) {
      googleMapRef.current = new (window as any).google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 7,
        mapTypeId: 'roadmap',
        disableDefaultUI: false
      });
    }

    // clear markers
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    familyMembers.forEach(member => {
      const marker = new (window as any).google.maps.Marker({
        position: { lat: member.lat, lng: member.lng },
        map: googleMapRef.current,
        label: member.name.charAt(0).toUpperCase()
      });
      googleMarkersRef.current.push(marker);
    });

    if (familyMembers.length > 1) {
      const bounds = new (window as any).google.maps.LatLngBounds();
      familyMembers.forEach(m => bounds.extend({ lat: m.lat, lng: m.lng }));
      googleMapRef.current.fitBounds(bounds, 24);
    } else {
      googleMapRef.current.setCenter(defaultCenter);
    }
  }, [provider, familyMembers, googleKey, googleReady]);

  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Family Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={provider} onValueChange={(v) => setProvider(v as 'osm' | 'google')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Map provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="osm">OpenStreetMap</SelectItem>
                <SelectItem value="google">Google Maps</SelectItem>
              </SelectContent>
            </Select>
            {provider === 'google' && (
              <Input
                placeholder="Google Maps API key"
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                className="w-[220px]"
              />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative bg-muted rounded-lg h-64 overflow-hidden">
          <div ref={mapContainerRef} className="absolute inset-0" />
          {provider === 'google' && (!googleKey || !googleReady) && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground px-4 text-center">
              Enter your Google Maps public API key to load the map.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
