// TypeScript interfaces only - Data now comes from Backend API
// This file is kept for backwards compatibility with any remaining imports

export interface Device {
  id: string;
  name: string;
  ip: string;
  type: 'router' | 'switch' | 'server' | 'firewall' | 'ap';
  status: 'online' | 'offline' | 'warning';
  uptime: string;
  cpuLoad: number;
  memoryUsage: number;
  lastResponse: number;
  vendor: string;
}

export interface TrafficDataPoint {
  time: string;
  inbound: number;
  outbound: number;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

// Note: All data is now fetched from the Backend API via:
// - /api/devices
// - /api/alerts
// - /api/realtime
// - /api/stats
// See src/lib/api.ts for API functions
// See src/hooks/useDevices.ts, useAlerts.ts, useRealtime.ts for React hooks
