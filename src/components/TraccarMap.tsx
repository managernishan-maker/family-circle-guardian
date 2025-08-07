import React, { useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  GpsFixed as GpsIcon,
  Speed as SpeedIcon,
  Schedule as TimeIcon,
  Accuracy as AccuracyIcon
} from '@mui/icons-material';
import { TraccarClientState, TraccarConfiguration } from '@/hooks/useTraccarClient';

interface TraccarMapProps {
  config: TraccarConfiguration;
  state: TraccarClientState;
}

declare global {
  interface Window {
    L?: any;
  }
}

export function TraccarMap({ config, state }: TraccarMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet CSS and JS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && state.currentPosition) {
      updateMap();
    }
  }, [state.currentPosition]);

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    try {
      const L = window.L;
      
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([27.7172, 85.3240], 13); // Default to Kathmandu

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Update map if position is available
      if (state.currentPosition) {
        updateMap();
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  };

  const updateMap = () => {
    if (!mapInstanceRef.current || !state.currentPosition || !window.L) return;

    const L = window.L;
    const { latitude, longitude, accuracy, speed, heading } = state.currentPosition.coords;

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Create custom icon based on motion state
    const getMarkerIcon = () => {
      const color = state.motionState === 'moving' ? 'green' : 
                   state.motionState === 'stationary' ? 'orange' : 'blue';
      
      return L.divIcon({
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    };

    // Add new marker
    markerRef.current = L.marker([latitude, longitude], {
      icon: getMarkerIcon()
    }).addTo(mapInstanceRef.current);

    // Add accuracy circle if available
    if (accuracy && accuracy < 1000) {
      L.circle([latitude, longitude], {
        radius: accuracy,
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0.1,
        weight: 2
      }).addTo(mapInstanceRef.current);
    }

    // Add popup with details
    const popupContent = `
      <div>
        <strong>Current Position</strong><br/>
        Lat: ${latitude.toFixed(6)}<br/>
        Lng: ${longitude.toFixed(6)}<br/>
        ${speed ? `Speed: ${(speed * 3.6).toFixed(1)} km/h<br/>` : ''}
        ${heading ? `Heading: ${heading.toFixed(0)}°<br/>` : ''}
        ${accuracy ? `Accuracy: ±${accuracy.toFixed(0)}m<br/>` : ''}
        State: ${state.motionState}<br/>
        Time: ${new Date(state.currentPosition.timestamp).toLocaleString()}
      </div>
    `;
    
    markerRef.current.bindPopup(popupContent);

    // Center map on position
    mapInstanceRef.current.setView([latitude, longitude], 16);
  };

  const formatCoordinate = (coord: number) => coord.toFixed(6);
  const formatSpeed = (speed?: number) => speed ? `${(speed * 3.6).toFixed(1)} km/h` : '0 km/h';
  const formatAccuracy = (accuracy?: number) => accuracy ? `±${accuracy.toFixed(0)}m` : 'Unknown';

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Map */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box
                ref={mapRef}
                sx={{
                  height: 500,
                  width: '100%',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Info Panel */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Position Information
              </Typography>
              
              {state.currentPosition ? (
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Latitude"
                      secondary={formatCoordinate(state.currentPosition.coords.latitude)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Longitude"
                      secondary={formatCoordinate(state.currentPosition.coords.longitude)}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Speed"
                      secondary={formatSpeed(state.currentPosition.coords.speed)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Heading"
                      secondary={state.currentPosition.coords.heading ? `${state.currentPosition.coords.heading.toFixed(0)}°` : 'Unknown'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Altitude"
                      secondary={state.currentPosition.coords.altitude ? `${state.currentPosition.coords.altitude.toFixed(0)}m` : 'Unknown'}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Accuracy"
                      secondary={formatAccuracy(state.currentPosition.coords.accuracy)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Motion State"
                      secondary={
                        <Chip
                          label={state.motionState}
                          color={
                            state.motionState === 'moving' ? 'success' :
                            state.motionState === 'stationary' ? 'warning' : 'info'
                          }
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Last Update"
                      secondary={new Date(state.currentPosition.timestamp).toLocaleString()}
                    />
                  </ListItem>
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No position data available. Start tracking to see your location on the map.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Device Status */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Status
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Connection"
                    secondary={
                      <Chip
                        label={state.isConnected ? 'Connected' : 'Disconnected'}
                        color={state.isConnected ? 'success' : 'error'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Tracking"
                    secondary={
                      <Chip
                        label={state.isTracking ? 'Active' : 'Stopped'}
                        color={state.isTracking ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                {state.batteryLevel !== undefined && (
                  <ListItem>
                    <ListItemText
                      primary="Battery"
                      secondary={`${state.batteryLevel}%${state.isCharging ? ' (Charging)' : ''}`}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemText
                    primary="Positions Sent"
                    secondary={state.sentCount}
                  />
                </ListItem>
                {state.errorCount > 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Errors"
                      secondary={
                        <Chip
                          label={state.errorCount}
                          color="error"
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}