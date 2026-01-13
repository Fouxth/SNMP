// Mock data for NMS Dashboard

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
  message: string;
  device: string;
  timestamp: string;
}

export const devices: Device[] = [
  { id: '1', name: 'core-router-01', ip: '10.0.1.1', type: 'router', status: 'online', uptime: '45d 12h 30m', cpuLoad: 23, memoryUsage: 45, lastResponse: 2, vendor: 'Cisco' },
  { id: '2', name: 'dist-switch-01', ip: '10.0.1.10', type: 'switch', status: 'online', uptime: '120d 5h 15m', cpuLoad: 12, memoryUsage: 32, lastResponse: 1, vendor: 'Cisco' },
  { id: '3', name: 'dist-switch-02', ip: '10.0.1.11', type: 'switch', status: 'warning', uptime: '89d 2h 45m', cpuLoad: 78, memoryUsage: 85, lastResponse: 5, vendor: 'Juniper' },
  { id: '4', name: 'web-server-01', ip: '10.0.2.100', type: 'server', status: 'online', uptime: '15d 8h 20m', cpuLoad: 45, memoryUsage: 67, lastResponse: 3, vendor: 'Dell' },
  { id: '5', name: 'web-server-02', ip: '10.0.2.101', type: 'server', status: 'online', uptime: '15d 8h 20m', cpuLoad: 38, memoryUsage: 52, lastResponse: 2, vendor: 'Dell' },
  { id: '6', name: 'db-server-01', ip: '10.0.2.200', type: 'server', status: 'online', uptime: '60d 4h 10m', cpuLoad: 62, memoryUsage: 78, lastResponse: 1, vendor: 'HP' },
  { id: '7', name: 'fw-edge-01', ip: '10.0.0.1', type: 'firewall', status: 'online', uptime: '200d 15h 0m', cpuLoad: 35, memoryUsage: 48, lastResponse: 1, vendor: 'Palo Alto' },
  { id: '8', name: 'access-switch-01', ip: '10.0.3.1', type: 'switch', status: 'online', uptime: '95d 11h 30m', cpuLoad: 8, memoryUsage: 22, lastResponse: 2, vendor: 'Cisco' },
  { id: '9', name: 'access-switch-02', ip: '10.0.3.2', type: 'switch', status: 'offline', uptime: '0d 0h 0m', cpuLoad: 0, memoryUsage: 0, lastResponse: 9999, vendor: 'Cisco' },
  { id: '10', name: 'wifi-ap-01', ip: '10.0.4.10', type: 'ap', status: 'online', uptime: '30d 6h 45m', cpuLoad: 15, memoryUsage: 28, lastResponse: 3, vendor: 'Ubiquiti' },
  { id: '11', name: 'wifi-ap-02', ip: '10.0.4.11', type: 'ap', status: 'online', uptime: '30d 6h 45m', cpuLoad: 18, memoryUsage: 31, lastResponse: 2, vendor: 'Ubiquiti' },
  { id: '12', name: 'backup-server-01', ip: '10.0.2.250', type: 'server', status: 'online', uptime: '90d 0h 15m', cpuLoad: 55, memoryUsage: 72, lastResponse: 4, vendor: 'Dell' },
];

export const generateTrafficData = (): TrafficDataPoint[] => {
  const data: TrafficDataPoint[] = [];
  const now = new Date();
  
  for (let i = 59; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const baseInbound = 450 + Math.sin(i / 10) * 100;
    const baseOutbound = 320 + Math.cos(i / 8) * 80;
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      inbound: Math.round(baseInbound + Math.random() * 50),
      outbound: Math.round(baseOutbound + Math.random() * 40),
    });
  }
  
  return data;
};

export const alerts: Alert[] = [
  { id: '1', severity: 'critical', message: 'Device unreachable', device: 'access-switch-02', timestamp: '2 min ago' },
  { id: '2', severity: 'warning', message: 'High CPU utilization (78%)', device: 'dist-switch-02', timestamp: '15 min ago' },
  { id: '3', severity: 'warning', message: 'Memory usage above threshold', device: 'dist-switch-02', timestamp: '15 min ago' },
  { id: '4', severity: 'info', message: 'Config backup completed', device: 'core-router-01', timestamp: '1 hour ago' },
];

export const getDeviceStats = () => {
  const total = devices.length;
  const online = devices.filter(d => d.status === 'online').length;
  const offline = devices.filter(d => d.status === 'offline').length;
  const warning = devices.filter(d => d.status === 'warning').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const avgLatency = Math.round(
    devices.filter(d => d.status !== 'offline').reduce((acc, d) => acc + d.lastResponse, 0) / 
    devices.filter(d => d.status !== 'offline').length
  );
  
  return { total, online, offline, warning, criticalAlerts, avgLatency };
};

export const getTopCpuDevices = () => {
  return [...devices]
    .filter(d => d.status !== 'offline')
    .sort((a, b) => b.cpuLoad - a.cpuLoad)
    .slice(0, 5);
};
