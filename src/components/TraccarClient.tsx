import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Settings as SettingsIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useTraccarClient } from '@/hooks/useTraccarClient';
import { TraccarConfiguration } from './TraccarConfiguration';
import { TraccarDashboard } from './TraccarDashboard';
import { TraccarLogs } from './TraccarLogs';
import { TraccarMap } from './TraccarMap';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export function TraccarClient() {
  const [currentTab, setCurrentTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    config,
    state,
    updateConfig,
    authenticate,
    startTracking,
    stopTracking,
    disconnect,
    sendCurrentPosition
  } = useTraccarClient();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const getStatusColor = () => {
    if (!state.isConnected) return 'error';
    if (state.isTracking) return 'success';
    return 'warning';
  };

  const tabs = [
    { label: 'Dashboard', icon: <DashboardIcon />, component: TraccarDashboard },
    { label: 'Configuration', icon: <SettingsIcon />, component: TraccarConfiguration },
    { label: 'Map', icon: <LocationIcon />, component: TraccarMap },
    { label: 'Logs', icon: <TimelineIcon />, component: TraccarLogs }
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Traccar Client
          </Typography>
          
          <Badge
            variant="dot"
            color={getStatusColor()}
            sx={{ mr: 2 }}
          >
            <Typography variant="body2" color="inherit">
              {state.status === 'tracking' ? 'Tracking' : 
               state.status === 'connecting' ? 'Connecting' :
               state.isConnected ? 'Connected' : 'Disconnected'}
            </Typography>
          </Badge>

          {state.batteryLevel !== undefined && (
            <Typography variant="body2" color="inherit" sx={{ ml: 2 }}>
              🔋 {state.batteryLevel}%{state.isCharging ? ' ⚡' : ''}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={tab.label}
                  iconPosition="start"
                  sx={{
                    '& .MuiSvgIcon-root': {
                      mr: 1
                    }
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {tabs.map((tab, index) => {
            const Component = tab.component;
            return (
              <TabPanel key={index} value={currentTab} index={index}>
                <Component
                  config={config}
                  state={state}
                  updateConfig={updateConfig}
                  authenticate={authenticate}
                  startTracking={startTracking}
                  stopTracking={stopTracking}
                  disconnect={disconnect}
                  sendCurrentPosition={sendCurrentPosition}
                />
              </TabPanel>
            );
          })}
        </Paper>
      </Container>
    </Box>
  );
}