// API Types - Shared interfaces for NMS
export interface Device {
    id: string;
    name: string;
    ip: string;
    mac?: string;
    type: 'router' | 'switch' | 'server' | 'firewall' | 'ap';
    status: 'online' | 'offline' | 'warning';
    uptime: string;
    cpuLoad: number;
    memoryUsage: number;
    lastResponse: number;
    vendor: string;
}

export interface Alert {
    id: string;
    timestamp: string;
    severity: 'critical' | 'warning' | 'info';
    source: string;
    message: string;
    acknowledged: boolean;
    oid?: string;
}

export interface RealtimeData {
    status: string;
    cpu_usage: number;
    ram_total: number;
    ram_used: number;
    ram_usage_percent: number;
    net_in_mbps: number;
    net_out_mbps: number;
}

export interface DeviceStats {
    total: number;
    online: number;
    offline: number;
    warning: number;
    criticalAlerts: number;
    avgLatency: number;
}

export interface TrafficDataPoint {
    time: string;
    inbound: number;
    outbound: number;
}
