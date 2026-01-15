import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useDevices } from '@/hooks/useDevices';
import { Device } from '@/lib/types';
import { addDevice, updateDevice, deleteDevice } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Plus,
    Pencil,
    Trash2,
    Search,
    RefreshCw,
    Loader2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const deviceIcons: Record<Device['type'], React.ElementType> = {
    router: Router,
    switch: Server,
    server: Server,
    firewall: Shield,
    ap: Wifi,
};

function StatusBadge({ status }: { status: Device['status'] }) {
    return (
        <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            status === 'online' && 'bg-nms-online/20 text-nms-online',
            status === 'offline' && 'bg-nms-offline/20 text-nms-offline',
            status === 'warning' && 'bg-nms-warning/20 text-nms-warning',
        )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

const DeviceInventory = () => {
    const { devices, loading, refresh, scanNetwork } = useDevices();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newDevice, setNewDevice] = useState<Partial<Device>>({
        name: '',
        ip: '',
        type: 'server',
        vendor: '',
    });

    const filteredDevices = devices.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.ip.includes(searchTerm) ||
        device.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddDevice = async () => {
        setIsSubmitting(true);
        try {
            await addDevice({
                name: newDevice.name || '',
                ip: newDevice.ip || '',
                type: newDevice.type || 'server',
                vendor: newDevice.vendor || 'Unknown',
            });
            setIsAddDialogOpen(false);
            setNewDevice({ name: '', ip: '', type: 'server', vendor: '' });
            await refresh();
            toast.success('Device added successfully');
        } catch {
            toast.error('Failed to add device');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditDevice = async () => {
        if (!selectedDevice) return;
        setIsSubmitting(true);
        try {
            await updateDevice(selectedDevice.id, {
                name: newDevice.name || '',
                ip: newDevice.ip || '',
                type: newDevice.type || 'server',
                vendor: newDevice.vendor || 'Unknown',
            });
            setIsEditDialogOpen(false);
            setSelectedDevice(null);
            await refresh();
            toast.success('Device updated');
        } catch {
            toast.error('Failed to update device');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDevice = async () => {
        if (!selectedDevice) return;
        setIsSubmitting(true);
        try {
            await deleteDevice(selectedDevice.id);
            setIsDeleteDialogOpen(false);
            setSelectedDevice(null);
            await refresh();
            toast.success('Device deleted');
        } catch {
            toast.error('Failed to delete device');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScanNetwork = async () => {
        toast.info('Scanning network...');
        await scanNetwork();
        toast.success('Network scan completed');
    };

    const openEditDialog = (device: Device) => {
        setSelectedDevice(device);
        setNewDevice({
            name: device.name,
            ip: device.ip,
            type: device.type,
            vendor: device.vendor,
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (device: Device) => {
        setSelectedDevice(device);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />

            <div className="ml-16">
                <Header />

                <main className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Device Inventory</h1>
                            <p className="text-muted-foreground">Manage all monitored devices</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleScanNetwork} disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                Scan Network
                            </Button>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Device
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search devices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-background border-border"
                        />
                    </div>

                    {/* Device Table */}
                    <div className="nms-card-glow">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead>Device</TableHead>
                                    <TableHead className="font-mono">IP Address</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Uptime</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && filteredDevices.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No devices found. Click "Scan Network" to discover devices.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredDevices.map((device) => {
                                    const Icon = deviceIcons[device.type] || Server;
                                    return (
                                        <TableRow key={device.id} className="border-border">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">{device.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{device.ip}</TableCell>
                                            <TableCell className="capitalize">{device.type}</TableCell>
                                            <TableCell>{device.vendor}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={device.status} />
                                            </TableCell>
                                            <TableCell>{device.uptime}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => openEditDialog(device)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-nms-offline hover:text-nms-offline"
                                                        onClick={() => openDeleteDialog(device)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </main>
            </div>

            {/* Add Device Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Device</DialogTitle>
                        <DialogDescription>
                            Add a new device to your monitoring inventory.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Device Name</Label>
                            <Input
                                id="name"
                                value={newDevice.name}
                                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                                placeholder="e.g., core-router-01"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ip">IP Address</Label>
                            <Input
                                id="ip"
                                value={newDevice.ip}
                                onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                                placeholder="e.g., 10.0.1.1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Device Type</Label>
                            <Select
                                value={newDevice.type}
                                onValueChange={(value) => setNewDevice({ ...newDevice, type: value as Device['type'] })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="router">Router</SelectItem>
                                    <SelectItem value="switch">Switch</SelectItem>
                                    <SelectItem value="server">Server</SelectItem>
                                    <SelectItem value="firewall">Firewall</SelectItem>
                                    <SelectItem value="ap">Access Point</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vendor">Vendor</Label>
                            <Input
                                id="vendor"
                                value={newDevice.vendor}
                                onChange={(e) => setNewDevice({ ...newDevice, vendor: e.target.value })}
                                placeholder="e.g., Cisco"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddDevice} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Add Device
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Device Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Device</DialogTitle>
                        <DialogDescription>
                            Update device information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Device Name</Label>
                            <Input
                                id="edit-name"
                                value={newDevice.name}
                                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-ip">IP Address</Label>
                            <Input
                                id="edit-ip"
                                value={newDevice.ip}
                                onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-type">Device Type</Label>
                            <Select
                                value={newDevice.type}
                                onValueChange={(value) => setNewDevice({ ...newDevice, type: value as Device['type'] })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="router">Router</SelectItem>
                                    <SelectItem value="switch">Switch</SelectItem>
                                    <SelectItem value="server">Server</SelectItem>
                                    <SelectItem value="firewall">Firewall</SelectItem>
                                    <SelectItem value="ap">Access Point</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-vendor">Vendor</Label>
                            <Input
                                id="edit-vendor"
                                value={newDevice.vendor}
                                onChange={(e) => setNewDevice({ ...newDevice, vendor: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditDevice} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Device</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedDevice?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteDevice} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DeviceInventory;
