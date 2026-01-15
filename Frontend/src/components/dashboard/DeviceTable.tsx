import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevices } from '@/hooks/useDevices';
import { Device } from '@/lib/types';
import { pingDevice } from '@/lib/api';
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
  Info,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
        <div className={cn('h-full rounded-full transition-all', getColor())} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs font-mono w-8">{value}%</span>
    </div>
  );
}

export function DeviceTable() {
  const navigate = useNavigate();
  const { devices, loading } = useDevices();
  const [pingDialogOpen, setPingDialogOpen] = useState(false);
  const [rebootDialogOpen, setRebootDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [pingResult, setPingResult] = useState<{ status: 'idle' | 'pinging' | 'done', results: string[] }>({ status: 'idle', results: [] });

  const handlePing = async (device: Device) => {
    setSelectedDevice(device);
    setPingResult({ status: 'pinging', results: [] });
    setPingDialogOpen(true);

    try {
      const result = await pingDevice(device.id);
      setPingResult({
        status: 'done',
        results: result.output
      });
    } catch {
      setPingResult({
        status: 'done',
        results: ['Error: Failed to ping device']
      });
    }
  };

  const handleReboot = (device: Device) => {
    setSelectedDevice(device);
    setRebootDialogOpen(true);
  };

  const confirmReboot = () => {
    if (selectedDevice) {
      toast.success('Reboot initiated', {
        description: `${selectedDevice.name} is rebooting. This may take a few minutes.`
      });
    }
    setRebootDialogOpen(false);
  };

  const handleDetails = (device: Device) => {
    setSelectedDevice(device);
    setDetailDialogOpen(true);
  };

  return (
    <>
      <div className="nms-card-glow animate-fade-in">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Monitored Devices</h3>
            <p className="text-sm text-muted-foreground">{devices.length} devices in inventory</p>
          </div>
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Button variant="outline" onClick={() => navigate('/devices')}>View All</Button>
          </div>
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
              {devices.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No devices found. Click "Scan Network" to discover devices.
                  </TableCell>
                </TableRow>
              )}
              {devices.map((device) => {
                const Icon = deviceIcons[device.type] || Server;
                return (
                  <TableRow
                    key={device.id}
                    className={cn(
                      "border-border transition-colors cursor-pointer hover:bg-muted/50",
                      device.status === 'offline' && 'bg-nms-offline/5',
                      device.status === 'warning' && 'bg-nms-warning/5',
                    )}
                    onClick={() => handleDetails(device)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
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
                      {device.status === 'offline' ? <span className="text-nms-offline">—</span> : device.uptime}
                    </TableCell>
                    <TableCell>
                      {device.status === 'offline' ? <span className="text-nms-offline text-xs">N/A</span> : <MetricBar value={device.cpuLoad} />}
                    </TableCell>
                    <TableCell>
                      {device.status === 'offline' ? <span className="text-nms-offline text-xs">N/A</span> : <MetricBar value={device.memoryUsage} />}
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => handlePing(device)} className="gap-2">
                            <Send className="w-4 h-4" />Ping
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReboot(device)} className="gap-2">
                            <RotateCcw className="w-4 h-4" />Reboot
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDetails(device)} className="gap-2">
                            <Info className="w-4 h-4" />Details
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

      {/* Ping Dialog */}
      <Dialog open={pingDialogOpen} onOpenChange={setPingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ping {selectedDevice?.name}</DialogTitle>
            <DialogDescription>Pinging {selectedDevice?.ip}</DialogDescription>
          </DialogHeader>
          <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 min-h-[150px]">
            <p className="text-muted-foreground mb-2">Pinging {selectedDevice?.ip} with 32 bytes of data:</p>
            {pingResult.results.map((result, i) => (
              <p key={i} className={result.includes('timed out') || result.includes('Error') ? 'text-red-400' : ''}>{result}</p>
            ))}
            {pingResult.status === 'pinging' && <Loader2 className="w-4 h-4 animate-spin mt-2" />}
            {pingResult.status === 'done' && (
              <p className="mt-2 text-muted-foreground">Ping complete.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setPingDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reboot Confirmation Dialog */}
      <AlertDialog open={rebootDialogOpen} onOpenChange={setRebootDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reboot {selectedDevice?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restart the device at {selectedDevice?.ip}. The device will be temporarily unavailable during the reboot process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReboot} className="bg-nms-warning hover:bg-nms-warning/90">Reboot</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Device Details Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDevice && (() => { const Icon = deviceIcons[selectedDevice.type] || Server; return <Icon className="w-5 h-5" />; })()}
              {selectedDevice?.name}
            </DialogTitle>
            <DialogDescription>{selectedDevice?.vendor} • {selectedDevice?.type}</DialogDescription>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <p className="font-mono font-medium">{selectedDevice.ip}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={cn('font-medium capitalize', selectedDevice.status === 'online' && 'text-nms-online', selectedDevice.status === 'offline' && 'text-nms-offline', selectedDevice.status === 'warning' && 'text-nms-warning')}>{selectedDevice.status}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="font-mono font-medium">{selectedDevice.uptime}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Response Time</p>
                  <p className="font-mono font-medium">{selectedDevice.lastResponse}ms</p>
                </div>
              </div>
              {selectedDevice.status !== 'offline' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Load</span>
                      <span className="font-mono">{selectedDevice.cpuLoad}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', selectedDevice.cpuLoad >= 80 ? 'bg-nms-offline' : selectedDevice.cpuLoad >= 60 ? 'bg-nms-warning' : 'bg-nms-online')} style={{ width: `${selectedDevice.cpuLoad}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span className="font-mono">{selectedDevice.memoryUsage}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', selectedDevice.memoryUsage >= 80 ? 'bg-nms-offline' : selectedDevice.memoryUsage >= 60 ? 'bg-nms-warning' : 'bg-nms-online')} style={{ width: `${selectedDevice.memoryUsage}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate('/devices')}>Edit Device</Button>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
