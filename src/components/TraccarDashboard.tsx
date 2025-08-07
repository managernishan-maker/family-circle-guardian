import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  GpsFixed as GpsIcon,
  Speed as SpeedIcon,
  Schedule as TimeIcon,
  Battery20 as BatteryIcon,
  CloudDone as CloudIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  SignalCellularAlt as SignalIcon
} from '@mui/icons-material';
import { TraccarClientState, TraccarConfiguration } from '@/hooks/useTraccarClient';

interface TraccarDashboardProps {
  config: TraccarConfiguration;
  state: TraccarClientState;
  authenticate: (username: string, password: string) => Promise<boolean>;
  startTracking: () => void;
  stopTracking: () => void;
  sendCurrentPosition: () => void;
}

export function TraccarDashboard({
  config,
  state,
  startTracking,
  stopTracking,
  sendCurrentPosition
}: TraccarDashboardProps) {

  const getMotionStateColor = () => {
    switch (state.motionState) {
      case 'moving': return 'success';
      case 'stationary': return 'warning';
      case 'sleeping': return 'info';
      default: return 'default';
    }
  };

  const getMotionStateIcon = () => {
    switch (state.motionState) {
      case 'moving': return '🚶';
      case 'stationary': return '⏸️';
      case 'sleeping': return '😴';
      default: return '❓';
    }
  };

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  const formatSpeed = (speed?: number) => {
    if (!speed) return '0 km/h';
    return `${speed.toFixed(1)} km/h`;
  };

  const formatAccuracy = (accuracy?: number) => {
    if (!accuracy) return 'Unknown';
    return `±${accuracy.toFixed(0)}m`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connection Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {state.isConnected ? (
                  <Chip
                    icon={<SuccessIcon />}
                    label="Connected"
                    color="success"
                    variant="filled"
                  />
                ) : (
                  <Chip
                    icon={<ErrorIcon />}
                    label="Disconnected"
                    color="error"
                    variant="filled"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Server: {config.protocol}://{config.serverUrl}:{config.port}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Device ID: {config.deviceId || 'Not set'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tracking Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  icon={state.isTracking ? <PlayIcon /> : <StopIcon />}
                  label={state.isTracking ? 'Active' : 'Stopped'}
                  color={state.isTracking ? 'success' : 'default'}
                  variant="filled"
                />
                <Chip
                  icon={<span>{getMotionStateIcon()}</span>}
                  label={state.motionState}
                  color={getMotionStateColor()}
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Mode: {config.trackingMode}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interval: {config.timeInterval}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Position */}
      {state.currentPosition && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Position
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <GpsIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Latitude
                  </Typography>
                  <Typography variant="h6">
                    {formatCoordinate(state.currentPosition.coords.latitude)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <GpsIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Longitude
                  </Typography>
                  <Typography variant="h6">
                    {formatCoordinate(state.currentPosition.coords.longitude)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <SpeedIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Speed
                  </Typography>
                  <Typography variant="h6">
                    {formatSpeed(state.currentPosition.coords.speed ? state.currentPosition.coords.speed * 3.6 : 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <SignalIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Accuracy
                  </Typography>
                  <Typography variant="h6">
                    {formatAccuracy(state.currentPosition.coords.accuracy)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Last update: {new Date(state.currentPosition.timestamp).toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Data Transmission
                </Typography>
              </Box>
              <Typography variant="h4" color="primary" gutterBottom>
                {state.sentCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Positions sent
              </Typography>
              {state.errorCount > 0 && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {state.errorCount} errors
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BatteryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Battery Status
                </Typography>
              </Box>
              {state.batteryLevel !== undefined ? (
                <>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {state.batteryLevel}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={state.batteryLevel}
                    sx={{ mb: 1 }}
                    color={state.batteryLevel < 20 ? 'error' : state.batteryLevel < 50 ? 'warning' : 'success'}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {state.isCharging ? '⚡ Charging' : '🔋 Not charging'}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Battery status unavailable
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Session Info
                </Typography>
              </Box>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Tracking Mode"
                    secondary={config.trackingMode}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="High Accuracy"
                    secondary={config.highAccuracy ? 'Enabled' : 'Disabled'}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Background Mode"
                    secondary={config.backgroundTracking ? 'Enabled' : 'Disabled'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Control Panel */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Control Panel
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {!state.isTracking ? (
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayIcon />}
              onClick={startTracking}
              disabled={!state.isAuthenticated}
              size="large"
            >
              Start Tracking
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopTracking}
              size="large"
            >
              Stop Tracking
            </Button>
          )}
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={sendCurrentPosition}
            disabled={!state.isAuthenticated || !state.currentPosition}
            size="large"
          >
            Send Position Now
          </Button>
        </Box>

        {state.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {state.error}
          </Alert>
        )}

        {!state.isAuthenticated && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please configure your server settings and authenticate in the Configuration tab.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}