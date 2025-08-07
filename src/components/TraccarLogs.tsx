import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { TraccarClientState, TraccarConfiguration } from '@/hooks/useTraccarClient';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'position' | 'error' | 'auth' | 'config';
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

interface TraccarLogsProps {
  config: TraccarConfiguration;
  state: TraccarClientState;
}

export function TraccarLogs({ config, state }: TraccarLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [filter, setFilter] = useState<'all' | 'position' | 'error' | 'auth' | 'config'>('all');
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    // Load logs from localStorage
    const savedLogs = localStorage.getItem('traccar_logs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setLogs(parsedLogs);
      } catch (error) {
        console.error('Failed to load logs:', error);
      }
    }
  }, []);

  const addLog = (type: LogEntry['type'], status: LogEntry['status'], message: string, data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      status,
      message,
      data
    };

    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 1000); // Keep last 1000 logs
      localStorage.setItem('traccar_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Log position updates
  useEffect(() => {
    if (state.lastSentPosition) {
      addLog('position', 'success', 'Position sent successfully', state.lastSentPosition);
    }
  }, [state.lastSentPosition]);

  // Log errors
  useEffect(() => {
    if (state.error) {
      addLog('error', 'error', state.error);
    }
  }, [state.error]);

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);

  const getStatusColor = (status: LogEntry['status']) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'position': return '📍';
      case 'error': return '❌';
      case 'auth': return '🔐';
      case 'config': return '⚙️';
      default: return '📝';
    }
  };

  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const handleExportLogs = () => {
    const logsData = JSON.stringify(logs, null, 2);
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traccar-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    setLogs([]);
    localStorage.removeItem('traccar_logs');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Tracking Logs ({filteredLogs.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              label="Filter"
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="position">Positions</MenuItem>
              <MenuItem value="error">Errors</MenuItem>
              <MenuItem value="auth">Auth</MenuItem>
              <MenuItem value="config">Config</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportLogs}
            disabled={logs.length === 0}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={handleClearLogs}
            disabled={logs.length === 0}
          >
            Clear
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Typography variant="body2">
                    {log.timestamp.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>{getTypeIcon(log.type)}</span>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {log.type}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.status}
                    color={getStatusColor(log.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {log.message}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(log)}
                    disabled={!log.data}
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No logs available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Log Details Dialog */}
      <Dialog
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Log Details - {selectedLog?.type}
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Timestamp: {selectedLog.timestamp.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status: {selectedLog.status}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Message: {selectedLog.message}
              </Typography>
              {selectedLog.data && (
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  value={JSON.stringify(selectedLog.data, null, 2)}
                  variant="outlined"
                  label="Data"
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                  }}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}