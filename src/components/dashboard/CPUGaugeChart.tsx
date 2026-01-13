import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getTopCpuDevices } from '@/lib/mockData';
import { Cpu } from 'lucide-react';

export function CPUGaugeChart() {
  const topDevices = getTopCpuDevices();
  
  const getStatusColor = (cpu: number) => {
    if (cpu >= 80) return 'hsl(0, 84%, 60%)';
    if (cpu >= 60) return 'hsl(38, 92%, 50%)';
    return 'hsl(142, 76%, 46%)';
  };
  
  const getStatusClass = (cpu: number) => {
    if (cpu >= 80) return 'text-nms-offline';
    if (cpu >= 60) return 'text-nms-warning';
    return 'text-nms-online';
  };
  
  return (
    <div className="nms-card-glow p-5 h-full animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Top CPU Usage</h3>
      </div>
      
      <div className="space-y-4">
        {topDevices.map((device, index) => {
          const gaugeData = [
            { value: device.cpuLoad },
            { value: 100 - device.cpuLoad },
          ];
          
          return (
            <div 
              key={device.id} 
              className="flex items-center gap-3"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Mini Gauge */}
              <div className="w-12 h-12 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      cx="50%"
                      cy="50%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={14}
                      outerRadius={20}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill={getStatusColor(device.cpuLoad)} />
                      <Cell fill="hsl(240, 5%, 17%)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <span className={`absolute inset-0 flex items-center justify-center text-xs font-mono font-bold ${getStatusClass(device.cpuLoad)}`}>
                  {device.cpuLoad}
                </span>
              </div>
              
              {/* Device Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{device.name}</span>
                  <span className={`text-xs font-mono ${getStatusClass(device.cpuLoad)}`}>
                    {device.cpuLoad}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{device.ip}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
