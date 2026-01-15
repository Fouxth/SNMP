import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { alerts } from '@/lib/mockData';
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
    AlertCircle,
    AlertTriangle,
    Info,
    Search,
    Filter,
    Download,
    RefreshCw,
    Trash2,
    CheckCircle
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface SNMPTrap {
    id: string;
    timestamp: string;
    severity: 'critical' | 'warning' | 'info';
    oid: string;
    source: string;
    message: string;
    acknowledged: boolean;
}

const generateTraps = (): SNMPTrap[] => [
    { id: '1', timestamp: '2024-01-15 13:45:23', severity: 'critical', oid: '1.3.6.1.4.1.9.9.43.1.1.6.1.3', source: 'access-switch-02 (10.0.3.2)', message: 'Device unreachable - SNMP timeout', acknowledged: false },
    { id: '2', timestamp: '2024-01-15 13:30:15', severity: 'warning', oid: '1.3.6.1.4.1.9.2.1.56', source: 'dist-switch-02 (10.0.1.11)', message: 'CPU utilization exceeded threshold (78%)', acknowledged: false },
    { id: '3', timestamp: '2024-01-15 13:30:12', severity: 'warning', oid: '1.3.6.1.4.1.9.9.48.1.1.1.6', source: 'dist-switch-02 (10.0.1.11)', message: 'Memory usage above warning level (85%)', acknowledged: true },
    { id: '4', timestamp: '2024-01-15 12:45:00', severity: 'info', oid: '1.3.6.1.6.3.1.1.5.4', source: 'core-router-01 (10.0.1.1)', message: 'Configuration backup completed successfully', acknowledged: true },
    { id: '5', timestamp: '2024-01-15 12:00:00', severity: 'info', oid: '1.3.6.1.6.3.1.1.5.3', source: 'fw-edge-01 (10.0.0.1)', message: 'Interface GigabitEthernet0/1 link up', acknowledged: true },
];

const severityIcons = { critical: AlertCircle, warning: AlertTriangle, info: Info };

const SNMPLogs = () => {
    const [traps, setTraps] = useState<SNMPTrap[]>(generateTraps());
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('all');

    const filteredTraps = traps.filter(trap => {
        const matchesSearch = trap.message.toLowerCase().includes(searchTerm.toLowerCase()) || trap.source.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = severityFilter === 'all' || trap.severity === severityFilter;
        return matchesSearch && matchesSeverity;
    });

    const handleAcknowledge = (id: string) => {
        setTraps(traps.map(t => t.id === id ? { ...t, acknowledged: true } : t));
        toast.success('Trap acknowledged');
    };

    const handleAcknowledgeAll = () => {
        setTraps(traps.map(t => ({ ...t, acknowledged: true })));
        toast.success('All traps acknowledged');
    };

    const handleExport = () => {
        toast.success('Export completed', { description: 'SNMP traps exported to CSV.' });
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="ml-16">
                <Header />
                <main className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">SNMP Traps & Logs</h1>
                            <p className="text-muted-foreground">Monitor network events</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => toast.success('Refreshed')}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
                            <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="nms-card-glow p-4 flex items-center gap-4">
                            <AlertCircle className="w-8 h-8 text-nms-offline" />
                            <div><p className="text-2xl font-bold">{traps.filter(t => t.severity === 'critical' && !t.acknowledged).length}</p><p className="text-sm text-muted-foreground">Critical</p></div>
                        </div>
                        <div className="nms-card-glow p-4 flex items-center gap-4">
                            <AlertTriangle className="w-8 h-8 text-nms-warning" />
                            <div><p className="text-2xl font-bold">{traps.filter(t => t.severity === 'warning' && !t.acknowledged).length}</p><p className="text-sm text-muted-foreground">Warnings</p></div>
                        </div>
                        <div className="nms-card-glow p-4 flex items-center gap-4">
                            <Info className="w-8 h-8 text-nms-info" />
                            <div><p className="text-2xl font-bold">{traps.filter(t => t.severity === 'info').length}</p><p className="text-sm text-muted-foreground">Info</p></div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Severity" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={handleAcknowledgeAll}><CheckCircle className="w-4 h-4 mr-2" />Ack All</Button>
                    </div>

                    <div className="nms-card-glow">
                        <Table>
                            <TableHeader>
                                <TableRow><TableHead>Severity</TableHead><TableHead>Timestamp</TableHead><TableHead>Source</TableHead><TableHead>Message</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTraps.map((trap) => {
                                    const Icon = severityIcons[trap.severity];
                                    return (
                                        <TableRow key={trap.id} className={cn(!trap.acknowledged && trap.severity === 'critical' && 'bg-nms-offline/5')}>
                                            <TableCell><Icon className={cn('w-5 h-5', trap.severity === 'critical' && 'text-nms-offline', trap.severity === 'warning' && 'text-nms-warning', trap.severity === 'info' && 'text-nms-info')} /></TableCell>
                                            <TableCell className="font-mono text-sm">{trap.timestamp}</TableCell>
                                            <TableCell>{trap.source}</TableCell>
                                            <TableCell>{trap.message}</TableCell>
                                            <TableCell>{trap.acknowledged ? <Badge variant="secondary">ACK</Badge> : <Badge variant="outline" className="border-nms-warning text-nms-warning">NEW</Badge>}</TableCell>
                                            <TableCell>{!trap.acknowledged && <Button variant="ghost" size="icon" onClick={() => handleAcknowledge(trap.id)}><CheckCircle className="w-4 h-4 text-nms-online" /></Button>}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SNMPLogs;
