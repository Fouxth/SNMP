import { devices, Device } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Router, 
  Server, 
  Shield, 
  Wifi, 
  MoreHorizontal,
  Send,
  RotateCcw,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const deviceIcons: Record<Device['type'], React.ElementType> = {
  router: Router,
  switch: Server,
  server: Server,
  firewall: Shield,
  ap: Wifi,
};

function StatusDot({ status }: { status: Device['status'] }) {
  return (
    <div className={cn(
      'status-dot',
      status === 'online' && 'status-online',
      status === 'offline' && 'status-offline',
      status === 'warning' && 'status-warning',
    )} />
  );
}

function MetricBar({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100;
  
  const getColor = () => {
    if (percentage >= 80) return 'bg-nms-offline';
    if (percentage >= 60) return 'bg-nms-warning';
    return 'bg-nms-online';
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-mono w-8">{value}%</span>
    </div>
  );
}

export function DeviceTable() {
  return (
    <div className="nms-card-glow animate-fade-in">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Monitored Devices</h3>
        <p className="text-sm text-muted-foreground">{devices.length} devices in inventory</p>
      </div>
      
      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Device Name</TableHead>
              <TableHead className="font-mono">IP Address</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>CPU Load</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead className="text-right">Response</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => {
              const Icon = deviceIcons[device.type];
              
              return (
                <TableRow 
                  key={device.id} 
                  className={cn(
                    "border-border transition-colors",
                    device.status === 'offline' && 'bg-nms-offline/5',
                    device.status === 'warning' && 'bg-nms-warning/5',
                  )}
                >
                  <TableCell>
                    <StatusDot status={device.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{device.name}</span>
                        <span className="text-xs text-muted-foreground block">{device.vendor}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{device.ip}</TableCell>
                  <TableCell className="text-sm">
                    {device.status === 'offline' ? (
                      <span className="text-nms-offline">—</span>
                    ) : (
                      device.uptime
                    )}
                  </TableCell>
                  <TableCell>
                    {device.status === 'offline' ? (
                      <span className="text-nms-offline text-xs">N/A</span>
                    ) : (
                      <MetricBar value={device.cpuLoad} />
                    )}
                  </TableCell>
                  <TableCell>
                    {device.status === 'offline' ? (
                      <span className="text-nms-offline text-xs">N/A</span>
                    ) : (
                      <MetricBar value={device.memoryUsage} />
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {device.status === 'offline' ? (
                      <span className="text-nms-offline">timeout</span>
                    ) : (
                      <span className={device.lastResponse <= 2 ? 'text-nms-online' : device.lastResponse <= 5 ? 'text-nms-warning' : 'text-nms-offline'}>
                        {device.lastResponse}ms
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem className="gap-2">
                          <Send className="w-4 h-4" />
                          Ping
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <RotateCcw className="w-4 h-4" />
                          Reboot
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Info className="w-4 h-4" />
                          Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
