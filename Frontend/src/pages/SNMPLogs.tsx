import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useAlerts } from '@/hooks/useAlerts';
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
    Download,
    RefreshCw,
    CheckCircle,
    Loader2
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

const severityIcons = { critical: AlertCircle, warning: AlertTriangle, info: Info };

const SNMPLogs = () => {
    const {
        alerts,
        loading,
        refresh,
        acknowledgeAlert,
        acknowledgeAllAlerts,
        criticalCount,
        warningCount,
        infoCount
    } = useAlerts();
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('all');

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) || alert.source.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
        return matchesSearch && matchesSeverity;
    });

    const handleAcknowledge = async (id: string) => {
        try {
            await acknowledgeAlert(id);
            toast.success('Alert acknowledged');
        } catch {
            toast.error('Failed to acknowledge alert');
        }
    };

    const handleAcknowledgeAll = async () => {
        try {
            await acknowledgeAllAlerts();
            toast.success('All alerts acknowledged');
        } catch {
            toast.error('Failed to acknowledge alerts');
        }
    };

    const handleRefresh = async () => {
        await refresh();
        toast.success('Alerts refreshed');
    };

    const handleExport = () => {
        const csv = alerts.map(a =>
            `${a.timestamp},${a.severity},${a.source},${a.message},${a.acknowledged}`
        ).join('\n');
        const blob = new Blob([`Timestamp,Severity,Source,Message,Acknowledged\n${csv}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'snmp_alerts.csv';
        a.click();
        toast.success('Export completed', { description: 'SNMP alerts exported to CSV.' });
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
                            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                Refresh
                            </Button>
                            <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="nms-card-glow p-4 flex items-center gap-4">
                            <AlertCircle className="w-8 h-8 text-nms-offline" />
                            <div><p className="text-2xl font-bold">{criticalCount}</p><p className="text-sm text-muted-foreground">Critical</p></div>
                        </div>
                        <div className="nms-card-glow p-4 flex items-center gap-4">
                            <AlertTriangle className="w-8 h-8 text-nms-warning" />
                            <div><p className="text-2xl font-bold">{warningCount}</p><p className="text-sm text-muted-foreground">Warnings</p></div>
                        </div>
                        <div className="nms-card-glow p-4 flex items-center gap-4">
                            <Info className="w-8 h-8 text-nms-info" />
                            <div><p className="text-2xl font-bold">{infoCount}</p><p className="text-sm text-muted-foreground">Info</p></div>
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
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && filteredAlerts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No alerts found
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredAlerts.map((alert) => {
                                    const Icon = severityIcons[alert.severity as keyof typeof severityIcons] || Info;
                                    return (
                                        <TableRow key={alert.id} className={cn(!alert.acknowledged && alert.severity === 'critical' && 'bg-nms-offline/5')}>
                                            <TableCell><Icon className={cn('w-5 h-5', alert.severity === 'critical' && 'text-nms-offline', alert.severity === 'warning' && 'text-nms-warning', alert.severity === 'info' && 'text-nms-info')} /></TableCell>
                                            <TableCell className="font-mono text-sm">{alert.timestamp}</TableCell>
                                            <TableCell>{alert.source}</TableCell>
                                            <TableCell>{alert.message}</TableCell>
                                            <TableCell>{alert.acknowledged ? <Badge variant="secondary">ACK</Badge> : <Badge variant="outline" className="border-nms-warning text-nms-warning">NEW</Badge>}</TableCell>
                                            <TableCell>{!alert.acknowledged && <Button variant="ghost" size="icon" onClick={() => handleAcknowledge(alert.id)}><CheckCircle className="w-4 h-4 text-nms-online" /></Button>}</TableCell>
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
