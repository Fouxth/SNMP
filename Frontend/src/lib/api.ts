// API Service for NMS Backend
import { Device, Alert, RealtimeData, DeviceStats } from './types';

const API_BASE = '/api';

// ==================== Device APIs ====================

export async function fetchDevices(): Promise<Device[]> {
    const response = await fetch(`${API_BASE}/devices`);
    if (!response.ok) throw new Error('Failed to fetch devices');
    const data = await response.json();
    return data.devices || [];
}

export async function scanLan(): Promise<Device[]> {
    const response = await fetch(`${API_BASE}/scan-lan`);
    if (!response.ok) throw new Error('Failed to scan LAN');
    const data = await response.json();
    return data.devices || [];
}

export async function addDevice(device: { name: string; ip: string; type: string; vendor: string }): Promise<Device> {
    const response = await fetch(`${API_BASE}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device),
    });
    if (!response.ok) throw new Error('Failed to add device');
    return response.json();
}

export async function updateDevice(deviceId: string, device: { name: string; ip: string; type: string; vendor: string }): Promise<Device> {
    const response = await fetch(`${API_BASE}/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device),
    });
    if (!response.ok) throw new Error('Failed to update device');
    return response.json();
}

export async function deleteDevice(deviceId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/devices/${deviceId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete device');
}

export async function pingDevice(deviceId: string): Promise<{ success: boolean; output: string[] }> {
    const response = await fetch(`${API_BASE}/ping/${deviceId}`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to ping device');
    return response.json();
}

// ==================== Realtime APIs ====================

export async function fetchRealtime(target: string = '127.0.0.1'): Promise<RealtimeData> {
    const response = await fetch(`${API_BASE}/realtime?target=${encodeURIComponent(target)}`);
    if (!response.ok) throw new Error('Failed to fetch realtime data');
    return response.json();
}

// ==================== Stats APIs ====================

export async function fetchStats(): Promise<DeviceStats> {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
}

// ==================== Alert APIs ====================

export async function fetchAlerts(): Promise<Alert[]> {
    const response = await fetch(`${API_BASE}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    const data = await response.json();
    return data.alerts || [];
}

export async function acknowledgeAlert(alertId: string): Promise<Alert> {
    const response = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to acknowledge alert');
    return response.json();
}

export async function acknowledgeAllAlerts(): Promise<void> {
    const response = await fetch(`${API_BASE}/alerts/acknowledge-all`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to acknowledge all alerts');
}
