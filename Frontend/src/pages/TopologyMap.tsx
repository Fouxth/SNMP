import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useDevices } from '@/hooks/useDevices';
import { Device } from '@/lib/types';
import {
    Router,
    Server,
    Shield,
    Wifi,
    ZoomIn,
    ZoomOut,
    Maximize2,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NetworkNode {
    id: string;
    name: string;
    ip: string;
    type: 'router' | 'switch' | 'server' | 'firewall' | 'ap';
    status: 'online' | 'offline' | 'warning';
    x: number;
    y: number;
    connections: string[];
}

const deviceIcons: Record<string, React.ElementType> = {
    router: Router,
    switch: Server,
    server: Server,
    firewall: Shield,
    ap: Wifi,
};

// Create network topology from devices
const createTopology = (devices: Device[]): NetworkNode[] => {
    const positions = [
        { x: 400, y: 50 }, { x: 400, y: 150 }, { x: 250, y: 250 },
        { x: 550, y: 250 }, { x: 150, y: 380 }, { x: 250, y: 380 },
        { x: 450, y: 380 }, { x: 100, y: 250 }, { x: 650, y: 250 },
        { x: 550, y: 380 }, { x: 650, y: 380 }, { x: 350, y: 380 },
    ];

    return devices.map((device, index) => ({
        id: device.id,
        name: device.name,
        ip: device.ip,
        type: device.type,
        status: device.status,
        x: positions[index % positions.length].x,
        y: positions[index % positions.length].y,
        connections: index > 0 ? [devices[Math.max(0, index - 1)].id] : [],
    }));
};

const TopologyMap = () => {
    const { devices, loading, refresh } = useDevices();
    const nodes = useMemo(() => createTopology(devices), [devices]);
    const [zoom, setZoom] = useState(1);
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

    const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 2));
    const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5));
    const handleReset = () => {
        setZoom(1);
        toast.info('Topology view reset');
    };
    const handleRefresh = async () => {
        await refresh();
        toast.success('Topology refreshed');
    };

    const getNodeColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-nms-online';
            case 'offline': return 'bg-nms-offline';
            case 'warning': return 'bg-nms-warning';
            default: return 'bg-muted';
        }
    };

    const getLineColor = (fromStatus: string, toStatus: string) => {
        if (fromStatus === 'offline' || toStatus === 'offline') return 'stroke-nms-offline';
        if (fromStatus === 'warning' || toStatus === 'warning') return 'stroke-nms-warning';
        return 'stroke-nms-online';
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />

            <div className="ml-16">
                <Header />

                <main className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Network Topology</h1>
                            <p className="text-muted-foreground">Visual map of your network infrastructure</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={handleZoomOut}>
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-mono w-16 text-center">{Math.round(zoom * 100)}%</span>
                            <Button variant="outline" size="icon" onClick={handleZoomIn}>
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleReset}>
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" onClick={handleRefresh} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Topology Canvas */}
                        <div className="lg:col-span-3 nms-card-glow p-4 h-[600px] overflow-hidden">
                            <div
                                className="w-full h-full relative"
                                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                            >
                                {/* Connection Lines */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    {nodes.map(node =>
                                        node.connections.map(connId => {
                                            const targetNode = nodes.find(n => n.id === connId);
                                            if (!targetNode) return null;
                                            return (
                                                <line
                                                    key={`${node.id}-${connId}`}
                                                    x1={node.x + 30}
                                                    y1={node.y + 30}
                                                    x2={targetNode.x + 30}
                                                    y2={targetNode.y + 30}
                                                    className={cn(
                                                        'stroke-2',
                                                        getLineColor(node.status, targetNode.status)
                                                    )}
                                                    strokeDasharray={node.status === 'offline' || targetNode.status === 'offline' ? '5,5' : ''}
                                                />
                                            );
                                        })
                                    )}
                                </svg>

                                {/* Nodes */}
                                {nodes.map(node => {
                                    const Icon = deviceIcons[node.type];
                                    const device = devices.find(d => d.id === node.id);

                                    return (
                                        <div
                                            key={node.id}
                                            className={cn(
                                                'absolute w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110',
                                                'bg-background/80 backdrop-blur-sm',
                                                selectedNode?.id === node.id && 'ring-2 ring-primary',
                                                node.status === 'online' && 'border-nms-online',
                                                node.status === 'offline' && 'border-nms-offline',
                                                node.status === 'warning' && 'border-nms-warning',
                                            )}
                                            style={{ left: node.x, top: node.y }}
                                            onClick={() => setSelectedNode(node)}
                                        >
                                            <Icon className={cn(
                                                'w-6 h-6',
                                                node.status === 'online' && 'text-nms-online',
                                                node.status === 'offline' && 'text-nms-offline',
                                                node.status === 'warning' && 'text-nms-warning',
                                            )} />
                                            <span className="text-[10px] font-mono mt-1 truncate max-w-14 text-center">
                                                {node.name.split('-')[0]}
                                            </span>
                                            {/* Status dot */}
                                            <div className={cn(
                                                'absolute -top-1 -right-1 w-3 h-3 rounded-full',
                                                getNodeColor(node.status)
                                            )} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Node Details Panel */}
                        <div className="nms-card-glow p-4">
                            <h3 className="font-semibold mb-4">Node Details</h3>
                            {selectedNode ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const Icon = deviceIcons[selectedNode.type];
                                            return <Icon className="w-8 h-8 text-primary" />;
                                        })()}
                                        <div>
                                            <p className="font-medium">{selectedNode.name}</p>
                                            <p className="text-sm text-muted-foreground font-mono">{selectedNode.ip}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className={cn(
                                                'font-medium capitalize',
                                                selectedNode.status === 'online' && 'text-nms-online',
                                                selectedNode.status === 'offline' && 'text-nms-offline',
                                                selectedNode.status === 'warning' && 'text-nms-warning',
                                            )}>
                                                {selectedNode.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Type</span>
                                            <span className="capitalize">{selectedNode.type}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Connections</span>
                                            <span>{selectedNode.connections.length}</span>
                                        </div>
                                    </div>

                                    {(() => {
                                        const device = devices.find(d => d.id === selectedNode.id);
                                        if (!device || device.status === 'offline') return null;
                                        return (
                                            <div className="pt-4 border-t border-border space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">CPU Load</span>
                                                    <span className="font-mono">{device.cpuLoad}%</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Memory</span>
                                                    <span className="font-mono">{device.memoryUsage}%</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Uptime</span>
                                                    <span className="font-mono text-xs">{device.uptime}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">Click on a node to view details</p>
                            )}

                            {/* Legend */}
                            <div className="mt-6 pt-4 border-t border-border">
                                <h4 className="text-sm font-medium mb-3">Legend</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-nms-online" />
                                        <span>Online</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-nms-warning" />
                                        <span>Warning</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-nms-offline" />
                                        <span>Offline</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TopologyMap;
