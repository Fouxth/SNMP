import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Bell, Shield, Database, Palette, Save, RotateCcw } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        snmpCommunity: 'public',
        snmpVersion: 'v2c',
        pollingInterval: 60,
        timeout: 5,
        retries: 3,
        emailNotifications: true,
        criticalAlerts: true,
        warningAlerts: true,
        infoAlerts: false,
        alertEmail: 'admin@company.com',
        dataRetention: 30,
        autoBackup: true,
        backupTime: '02:00',
        theme: 'dark',
        compactMode: false,
        showAnimations: true,
    });

    const handleSave = () => {
        toast.success('Settings saved', { description: 'Your configuration has been updated.' });
    };

    const handleReset = () => {
        toast.info('Settings reset to defaults');
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="ml-16">
                <Header />
                <main className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Settings</h1>
                            <p className="text-muted-foreground">Configure your NMS preferences</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
                            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
                        </div>
                    </div>

                    <Tabs defaultValue="snmp" className="space-y-6">
                        <TabsList className="grid w-full max-w-xl grid-cols-4">
                            <TabsTrigger value="snmp" className="gap-2"><SettingsIcon className="w-4 h-4" />SNMP</TabsTrigger>
                            <TabsTrigger value="alerts" className="gap-2"><Bell className="w-4 h-4" />Alerts</TabsTrigger>
                            <TabsTrigger value="data" className="gap-2"><Database className="w-4 h-4" />Data</TabsTrigger>
                            <TabsTrigger value="appearance" className="gap-2"><Palette className="w-4 h-4" />Theme</TabsTrigger>
                        </TabsList>

                        <TabsContent value="snmp" className="space-y-6">
                            <div className="nms-card-glow p-6 space-y-6">
                                <h3 className="text-lg font-semibold">SNMP Configuration</h3>
                                <div className="grid gap-4 max-w-md">
                                    <div className="grid gap-2">
                                        <Label>SNMP Version</Label>
                                        <Select value={settings.snmpVersion} onValueChange={(v) => setSettings({ ...settings, snmpVersion: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="v1">SNMPv1</SelectItem>
                                                <SelectItem value="v2c">SNMPv2c</SelectItem>
                                                <SelectItem value="v3">SNMPv3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Community String</Label>
                                        <Input type="password" value={settings.snmpCommunity} onChange={(e) => setSettings({ ...settings, snmpCommunity: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Polling Interval: {settings.pollingInterval}s</Label>
                                        <Slider value={[settings.pollingInterval]} onValueChange={(v) => setSettings({ ...settings, pollingInterval: v[0] })} min={10} max={300} step={10} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Timeout: {settings.timeout}s</Label>
                                        <Slider value={[settings.timeout]} onValueChange={(v) => setSettings({ ...settings, timeout: v[0] })} min={1} max={30} step={1} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Retries: {settings.retries}</Label>
                                        <Slider value={[settings.retries]} onValueChange={(v) => setSettings({ ...settings, retries: v[0] })} min={1} max={10} step={1} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="alerts" className="space-y-6">
                            <div className="nms-card-glow p-6 space-y-6">
                                <h3 className="text-lg font-semibold">Alert Notifications</h3>
                                <div className="space-y-4 max-w-md">
                                    <div className="flex items-center justify-between">
                                        <Label>Email Notifications</Label>
                                        <Switch checked={settings.emailNotifications} onCheckedChange={(v) => setSettings({ ...settings, emailNotifications: v })} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Critical Alerts</Label>
                                        <Switch checked={settings.criticalAlerts} onCheckedChange={(v) => setSettings({ ...settings, criticalAlerts: v })} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Warning Alerts</Label>
                                        <Switch checked={settings.warningAlerts} onCheckedChange={(v) => setSettings({ ...settings, warningAlerts: v })} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Info Alerts</Label>
                                        <Switch checked={settings.infoAlerts} onCheckedChange={(v) => setSettings({ ...settings, infoAlerts: v })} />
                                    </div>
                                    <div className="grid gap-2 pt-4">
                                        <Label>Alert Email</Label>
                                        <Input type="email" value={settings.alertEmail} onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="data" className="space-y-6">
                            <div className="nms-card-glow p-6 space-y-6">
                                <h3 className="text-lg font-semibold">Data Management</h3>
                                <div className="space-y-4 max-w-md">
                                    <div className="grid gap-2">
                                        <Label>Data Retention: {settings.dataRetention} days</Label>
                                        <Slider value={[settings.dataRetention]} onValueChange={(v) => setSettings({ ...settings, dataRetention: v[0] })} min={7} max={365} step={7} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Auto Backup</Label>
                                        <Switch checked={settings.autoBackup} onCheckedChange={(v) => setSettings({ ...settings, autoBackup: v })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Backup Time</Label>
                                        <Input type="time" value={settings.backupTime} onChange={(e) => setSettings({ ...settings, backupTime: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="appearance" className="space-y-6">
                            <div className="nms-card-glow p-6 space-y-6">
                                <h3 className="text-lg font-semibold">Appearance</h3>
                                <div className="space-y-4 max-w-md">
                                    <div className="grid gap-2">
                                        <Label>Theme</Label>
                                        <Select value={settings.theme} onValueChange={(v) => setSettings({ ...settings, theme: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="dark">Dark</SelectItem>
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="system">System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Compact Mode</Label>
                                        <Switch checked={settings.compactMode} onCheckedChange={(v) => setSettings({ ...settings, compactMode: v })} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Show Animations</Label>
                                        <Switch checked={settings.showAnimations} onCheckedChange={(v) => setSettings({ ...settings, showAnimations: v })} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
};

export default Settings;
