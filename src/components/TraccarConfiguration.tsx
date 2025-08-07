import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  InputAdornment,
  Divider,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  GpsFixed as GpsIcon
} from '@mui/icons-material';
import { TraccarClientState, type TraccarConfiguration } from '@/hooks/useTraccarClient';

interface TraccarConfigurationProps {
  config: TraccarConfiguration;
  state: TraccarClientState;
  updateConfig: (config: Partial<TraccarConfiguration>) => void;
  authenticate: (username: string, password: string) => Promise<boolean>;
  disconnect: () => void;
}

export function TraccarConfiguration({
  config,
  state,
  updateConfig,
  authenticate,
  disconnect
}: TraccarConfigurationProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [credentials, setCredentials] = useState({
    username: config.username || '',
    password: config.password || ''
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleConfigChange = (field: keyof TraccarConfiguration, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = () => {
    updateConfig(localConfig);
  };

  const handleAuthenticate = async () => {
    if (!credentials.username || !credentials.password) {
      setAuthError('Username and password are required');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const success = await authenticate(credentials.username, credentials.password);
      if (!success) {
        setAuthError('Authentication failed. Please check your credentials.');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const trackingModeDescriptions = {
    time: 'Send position updates at regular time intervals',
    distance: 'Send position updates when device moves a certain distance',
    angle: 'Send position updates when device changes direction significantly',
    hybrid: 'Send updates based on time, distance, or angle (whichever comes first)'
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Server Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Server Configuration
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Server URL"
                value={localConfig.serverUrl}
                onChange={(e) => handleConfigChange('serverUrl', e.target.value)}
                helperText="Traccar server hostname (without protocol)"
                placeholder="demo4.traccar.org"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Protocol</InputLabel>
                <Select
                  value={localConfig.protocol}
                  label="Protocol"
                  onChange={(e) => handleConfigChange('protocol', e.target.value)}
                >
                  <MenuItem value="http">HTTP</MenuItem>
                  <MenuItem value="https">HTTPS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Port"
                type="number"
                value={localConfig.port}
                onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
                helperText="Server port number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Device ID"
                value={localConfig.deviceId}
                onChange={(e) => handleConfigChange('deviceId', e.target.value)}
                helperText="Unique identifier for this device"
                placeholder="my-device-001"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Device Name"
                value={localConfig.deviceName || ''}
                onChange={(e) => handleConfigChange('deviceName', e.target.value)}
                helperText="Human-readable name (optional)"
                placeholder="My Phone"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveConfig}
            >
              Save Configuration
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Authentication
            </Typography>
            {state.isAuthenticated && (
              <Chip
                label="Authenticated"
                color="success"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username/Email"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                disabled={state.isAuthenticated}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                disabled={state.isAuthenticated}
              />
            </Grid>
          </Grid>

          {authError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {authError}
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {!state.isAuthenticated ? (
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={handleAuthenticate}
                disabled={isAuthenticating || !credentials.username || !credentials.password}
              >
                {isAuthenticating ? 'Authenticating...' : 'Login'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={disconnect}
                color="error"
              >
                Logout
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tracking Configuration */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GpsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Tracking Configuration</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Tracking Mode</FormLabel>
                <RadioGroup
                  value={localConfig.trackingMode}
                  onChange={(e) => handleConfigChange('trackingMode', e.target.value)}
                >
                  {Object.entries(trackingModeDescriptions).map(([mode, description]) => (
                    <FormControlLabel
                      key={mode}
                      value={mode}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {mode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {description}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Time Interval"
                type="number"
                value={localConfig.timeInterval}
                onChange={(e) => handleConfigChange('timeInterval', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">seconds</InputAdornment>,
                }}
                helperText="Send position every X seconds"
                disabled={localConfig.trackingMode === 'distance' || localConfig.trackingMode === 'angle'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Distance Threshold"
                type="number"
                value={localConfig.distanceThreshold}
                onChange={(e) => handleConfigChange('distanceThreshold', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">meters</InputAdornment>,
                }}
                helperText="Send position after moving X meters"
                disabled={localConfig.trackingMode === 'time'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Angle Threshold"
                type="number"
                value={localConfig.angleThreshold}
                onChange={(e) => handleConfigChange('angleThreshold', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">degrees</InputAdornment>,
                }}
                helperText="Send position after direction change"
                disabled={localConfig.trackingMode === 'time' || localConfig.trackingMode === 'distance'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stationary Heartbeat"
                type="number"
                value={localConfig.stationaryHeartbeat}
                onChange={(e) => handleConfigChange('stationaryHeartbeat', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">seconds</InputAdornment>,
                }}
                helperText="Send position when stationary (0 to disable)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Batch Size"
                type="number"
                value={localConfig.batchSize}
                onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
                helperText="Number of positions to send in batch"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Advanced Settings */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SpeedIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Advanced Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localConfig.highAccuracy}
                    onChange={(e) => handleConfigChange('highAccuracy', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">High Accuracy GPS</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use GPS for better accuracy (may drain battery faster)
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localConfig.backgroundTracking}
                    onChange={(e) => handleConfigChange('backgroundTracking', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Background Tracking</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Continue tracking when app is in background
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localConfig.motionDetection}
                    onChange={(e) => handleConfigChange('motionDetection', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Motion Detection</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Detect when device is moving or stationary
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localConfig.offlineMode}
                    onChange={(e) => handleConfigChange('offlineMode', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Offline Mode</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Store positions locally when server is unreachable
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Retry Attempts"
                type="number"
                value={localConfig.retryAttempts}
                onChange={(e) => handleConfigChange('retryAttempts', parseInt(e.target.value))}
                helperText="Number of times to retry failed sends"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveConfig}
          size="large"
        >
          Save All Settings
        </Button>
      </Box>
    </Box>
  );
}