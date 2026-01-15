// Custom hook for managing alerts state with auto-refresh
import { useState, useEffect, useCallback } from 'react';
import { Alert } from '@/lib/types';
import { fetchAlerts, acknowledgeAlert as apiAcknowledgeAlert, acknowledgeAllAlerts as apiAcknowledgeAllAlerts } from '@/lib/api';

interface UseAlertsReturn {
    alerts: Alert[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    acknowledgeAlert: (alertId: string) => Promise<void>;
    acknowledgeAllAlerts: () => Promise<void>;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
}

export function useAlerts(autoRefresh: boolean = true, refreshInterval: number = 10000): UseAlertsReturn {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setError(null);
            const data = await fetchAlerts();
            setAlerts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
            console.error('Error fetching alerts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const acknowledgeAlert = useCallback(async (alertId: string) => {
        try {
            await apiAcknowledgeAlert(alertId);
            setAlerts(prev =>
                prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
            );
        } catch (err) {
            console.error('Error acknowledging alert:', err);
            throw err;
        }
    }, []);

    const acknowledgeAllAlerts = useCallback(async () => {
        try {
            await apiAcknowledgeAllAlerts();
            setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
        } catch (err) {
            console.error('Error acknowledging all alerts:', err);
            throw err;
        }
    }, []);

    useEffect(() => {
        refresh();

        if (autoRefresh) {
            const interval = setInterval(refresh, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refresh, autoRefresh, refreshInterval]);

    const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
    const warningCount = alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length;
    const infoCount = alerts.filter(a => a.severity === 'info').length;

    return {
        alerts,
        loading,
        error,
        refresh,
        acknowledgeAlert,
        acknowledgeAllAlerts,
        criticalCount,
        warningCount,
        infoCount,
    };
}
