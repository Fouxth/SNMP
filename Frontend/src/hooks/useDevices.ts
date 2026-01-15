// Custom hook for managing devices state with auto-refresh
import { useState, useEffect, useCallback } from 'react';
import { Device, DeviceStats } from '@/lib/types';
import { fetchDevices, scanLan, fetchStats } from '@/lib/api';

interface UseDevicesReturn {
    devices: Device[];
    stats: DeviceStats;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    scanNetwork: () => Promise<void>;
}

const defaultStats: DeviceStats = {
    total: 0,
    online: 0,
    offline: 0,
    warning: 0,
    criticalAlerts: 0,
    avgLatency: 0,
};

export function useDevices(autoRefresh: boolean = true, refreshInterval: number = 10000): UseDevicesReturn {
    const [devices, setDevices] = useState<Device[]>([]);
    const [stats, setStats] = useState<DeviceStats>(defaultStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setError(null);
            const [devicesData, statsData] = await Promise.all([
                fetchDevices(),
                fetchStats(),
            ]);
            setDevices(devicesData);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch devices');
            console.error('Error fetching devices:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const scanNetwork = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            await scanLan();
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to scan network');
            console.error('Error scanning network:', err);
        } finally {
            setLoading(false);
        }
    }, [refresh]);

    useEffect(() => {
        refresh();

        if (autoRefresh) {
            const interval = setInterval(refresh, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refresh, autoRefresh, refreshInterval]);

    return { devices, stats, loading, error, refresh, scanNetwork };
}

// Helper function to get top CPU devices
export function getTopCpuDevices(devices: Device[], count: number = 5): Device[] {
    return [...devices]
        .filter(d => d.status !== 'offline')
        .sort((a, b) => b.cpuLoad - a.cpuLoad)
        .slice(0, count);
}
