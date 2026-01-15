import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRealtime } from '@/hooks/useRealtime';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export function TrafficChart() {
  const { data, trafficHistory, loading } = useRealtime('127.0.0.1', 2000);

  const currentInbound = data?.net_in_mbps || 0;
  const currentOutbound = data?.net_out_mbps || 0;

  return (
    <div className="nms-card-glow p-5 h-full animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Real-time Network Traffic</h3>
          <p className="text-sm text-muted-foreground">Live data from API</p>
        </div>

        <div className="flex items-center gap-6">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Inbound</span>
            <span className="font-mono font-semibold text-primary">
              {currentInbound.toFixed(2)} Mbps
            </span>
            <TrendingUp className="w-4 h-4 text-nms-online" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-nms-warning" />
            <span className="text-sm text-muted-foreground">Outbound</span>
            <span className="font-mono font-semibold text-nms-warning">
              {currentOutbound.toFixed(2)} Mbps
            </span>
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trafficHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(173, 80%, 50%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(173, 80%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 17%)" />
            <XAxis
              dataKey="time"
              stroke="hsl(240, 5%, 40%)"
              tick={{ fill: 'hsl(240, 5%, 60%)', fontSize: 11 }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(240, 5%, 40%)"
              tick={{ fill: 'hsl(240, 5%, 60%)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(240, 10%, 8%)',
                border: '1px solid hsl(240, 5%, 17%)',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono',
              }}
              labelStyle={{ color: 'hsl(0, 0%, 98%)' }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)} Mbps`,
                name === 'inbound' ? 'Inbound' : 'Outbound'
              ]}
            />
            <Area
              type="monotone"
              dataKey="inbound"
              stroke="hsl(173, 80%, 50%)"
              strokeWidth={2}
              fill="url(#inboundGradient)"
            />
            <Area
              type="monotone"
              dataKey="outbound"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fill="url(#outboundGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
