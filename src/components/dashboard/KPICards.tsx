import { Server, AlertTriangle, Activity, Clock } from 'lucide-react';
import { getDeviceStats } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';

interface KPICardProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function KPICard({ title, icon: Icon, children }: KPICardProps) {
  return (
    <div className="nms-card-glow p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      {children}
    </div>
  );
}

export function KPICards() {
  const stats = getDeviceStats();
  const upPercentage = Math.round((stats.online / stats.total) * 100);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Devices */}
      <KPICard title="Total Devices" icon={Server}>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold font-mono">{stats.total}</span>
          <span className="text-sm text-muted-foreground">monitored</span>
        </div>
      </KPICard>
      
      {/* Status Overview */}
      <KPICard title="Status Overview" icon={Activity}>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="status-dot status-online" />
              <span>{stats.online} Up</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="status-dot status-offline" />
              <span>{stats.offline} Down</span>
            </div>
          </div>
          <div className="relative">
            <Progress value={upPercentage} className="h-2 bg-secondary" />
            <div 
              className="absolute inset-0 h-2 rounded-full bg-nms-online"
              style={{ width: `${upPercentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{upPercentage}% availability</span>
        </div>
      </KPICard>
      
      {/* Active Alerts */}
      <KPICard title="Active Alerts" icon={AlertTriangle}>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold font-mono ${stats.criticalAlerts > 0 ? 'text-nms-offline' : 'text-nms-online'}`}>
            {stats.criticalAlerts}
          </span>
          <span className="text-sm text-muted-foreground">critical</span>
        </div>
        {stats.warning > 0 && (
          <span className="text-xs text-nms-warning">+ {stats.warning} warnings</span>
        )}
      </KPICard>
      
      {/* Avg Latency */}
      <KPICard title="Avg Latency" icon={Clock}>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold font-mono text-nms-online">{stats.avgLatency}</span>
          <span className="text-lg font-mono text-muted-foreground">ms</span>
        </div>
        <span className="text-xs text-muted-foreground">network average</span>
      </KPICard>
    </div>
  );
}
