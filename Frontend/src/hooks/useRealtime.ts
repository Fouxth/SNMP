// Custom hook for real-time data with auto-refresh
import { useState, useEffect, useCallback } from 'react';
import { RealtimeData, TrafficDataPoint } from '@/lib/types';
import { fetchRealtime } from '@/lib/api';

interface UseRealtimeReturn {
    data: RealtimeData | null;
    trafficHistory: TrafficDataPoint[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useRealtime(target: string = '127.0.0.1', refreshInterval: number = 1000): UseRealtimeReturn {
    const [data, setData] = useState<RealtimeData | null>(null);
    const [trafficHistory, setTrafficHistory] = useState<TrafficDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setError(null);
            const realtimeData = await fetchRealtime(target);
            setData(realtimeData);

            // Add to traffic history
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            setTrafficHistory(prev => {
                const newHistory = [...prev, {
                    time: timeStr,
                    inbound: realtimeData.net_in_mbps,
                    outbound: realtimeData.net_out_mbps,
                }];
                // Keep last 60 data points
                return newHistory.slice(-60);
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch realtime data');
            console.error('Error fetching realtime data:', err);
        } finally {
            setLoading(false);
        }
    }, [target]);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, refreshInterval);
        return () => clearInterval(interval);
    }, [refresh, refreshInterval]);

    return { data, trafficHistory, loading, error, refresh };
}
