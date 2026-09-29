import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Server, Activity, HardDrive, Cpu, Database, Network, Clock, RefreshCw, Play, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  cpu: number;
  memory: number;
}

interface CGServerStatus {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  version: string;
  uptime: string;
  channels: {
    total: number;
    active: number;
    idle: number;
  };
  performance: {
    cpu: number;
    memory: number;
    fps: number;
    latency: number;
  };
  lastSync: string;
}

const services: ServiceStatus[] = [
  { name: 'Web Server (Nginx)', status: 'running', uptime: '15d 7h 23m', cpu: 12, memory: 256 },
  { name: 'Application Server', status: 'running', uptime: '15d 7h 23m', cpu: 35, memory: 1024 },
  { name: 'Database Service', status: 'running', uptime: '15d 7h 23m', cpu: 18, memory: 512 },
  { name: 'Media Processing', status: 'running', uptime: '15d 7h 23m', cpu: 45, memory: 2048 },
  { name: 'Storage Manager', status: 'running', uptime: '15d 7h 23m', cpu: 8, memory: 128 },
  { name: 'Cache Service (Redis)', status: 'running', uptime: '15d 7h 23m', cpu: 5, memory: 256 },
];

const cgServers: CGServerStatus[] = [
  {
    id: 'cg-1',
    name: 'CG Server - Studio A',
    host: '192.168.1.101',
    port: 5250,
    status: 'online',
    version: 'CasparCG 2.3.3',
    uptime: '5d 12h 34m',
    channels: { total: 4, active: 2, idle: 2 },
    performance: { cpu: 28, memory: 1536, fps: 50, latency: 12 },
    lastSync: '2025-10-30 14:23:15',
  },
  {
    id: 'cg-2',
    name: 'CG Server - Studio B',
    host: '192.168.1.102',
    port: 5250,
    status: 'online',
    version: 'CasparCG 2.3.3',
    uptime: '5d 12h 34m',
    channels: { total: 4, active: 1, idle: 3 },
    performance: { cpu: 15, memory: 896, fps: 50, latency: 8 },
    lastSync: '2025-10-30 14:23:18',
  },
  {
    id: 'cg-3',
    name: 'CG Server - Backup',
    host: '192.168.1.103',
    port: 5250,
    status: 'offline',
    version: 'CasparCG 2.3.3',
    uptime: '-',
    channels: { total: 4, active: 0, idle: 0 },
    performance: { cpu: 0, memory: 0, fps: 0, latency: 0 },
    lastSync: '2025-10-30 08:15:42',
  },
];

export function ServerStatusView() {
  const [activeTab, setActiveTab] = useState('system');

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const config = {
      running: { label: 'Đang chạy', className: 'border-green-500 text-green-400' },
      stopped: { label: 'Dừng', className: 'border-border text-muted-foreground' },
      error: { label: 'Lỗi', className: 'border-red-500 text-red-400' },
    };
    const cfg = config[status];
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
  };

  const getCGStatusBadge = (status: CGServerStatus['status']) => {
    const config = {
      online: { label: 'Online', className: 'border-green-500 text-green-400 bg-green-900/20' },
      offline: { label: 'Offline', className: 'border-border text-muted-foreground bg-muted/20' },
      error: { label: 'Error', className: 'border-red-500 text-red-400 bg-red-900/20' },
    };
    const cfg = config[status];
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="bg-muted border border-border">
        <TabsTrigger value="system">Trạng thái System</TabsTrigger>
        <TabsTrigger value="cg-servers">Trạng thái Server CG</TabsTrigger>
      </TabsList>

      {/* System Status Tab */}
      <TabsContent value="system" className="space-y-4">
        {/* System Overview */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Tổng CPU</div>
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl text-foreground mb-2">42%</div>
            <Progress value={42} className="h-2" />
            <div className="text-xs text-muted-foreground mt-2">8 cores @ 3.2GHz</div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">RAM</div>
              <HardDrive className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl text-foreground mb-2">3.2GB</div>
            <Progress value={40} className="h-2" />
            <div className="text-xs text-muted-foreground mt-2">40% of 8GB used</div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Network In</div>
              <Network className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl text-foreground mb-2">125 Mbps</div>
            <div className="text-xs text-muted-foreground mt-2">Avg: 98 Mbps</div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Network Out</div>
              <Network className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl text-foreground mb-2">85 Mbps</div>
            <div className="text-xs text-muted-foreground mt-2">Avg: 72 Mbps</div>
          </Card>
        </div>

        {/* Services Status */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-primary" />
              <h3 className="text-primary">Trạng thái dịch vụ</h3>
            </div>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </div>

          <div className="space-y-4">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-4 bg-muted rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-foreground">{service.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Uptime: {service.uptime}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">CPU Usage</span>
                      <span className="text-foreground">{service.cpu}%</span>
                    </div>
                    <Progress value={service.cpu} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Memory</span>
                      <span className="text-foreground">{service.memory} MB</span>
                    </div>
                    <Progress value={(service.memory / 2048) * 100} className="h-1.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System Information */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-primary" />
              <h3 className="text-primary">Thông tin hệ thống</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Hostname</span>
                <span className="text-foreground">mamcg-media-server-01</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">OS</span>
                <span className="text-foreground">Ubuntu 22.04.3 LTS</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Kernel</span>
                <span className="text-foreground">5.15.0-89-generic</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Architecture</span>
                <span className="text-foreground">x86_64</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Uptime</span>
                <span className="text-foreground">15 days, 7:23:45</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Last Boot</span>
                <span className="text-foreground">2025-10-14 07:10:15</span>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-5 h-5 text-primary" />
              <h3 className="text-primary">Disk Usage</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">/ (Root)</span>
                  <span className="text-foreground">45GB / 100GB</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">/var (Logs & Cache)</span>
                  <span className="text-foreground">12GB / 50GB</span>
                </div>
                <Progress value={24} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">/mnt/media-storage</span>
                  <span className="text-foreground">4.8TB / 10TB</span>
                </div>
                <Progress value={48} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">/mnt/archive</span>
                  <span className="text-foreground">18.5TB / 50TB</span>
                </div>
                <Progress value={37} className="h-2" />
              </div>
            </div>
          </Card>
        </div>

        {/* Database Connections */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-primary">Kết nối Database</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded border border-border">
              <div className="text-3xl text-green-400 mb-2">12</div>
              <div className="text-sm text-muted-foreground">Active Connections</div>
            </div>
            <div className="text-center p-4 bg-muted rounded border border-border">
              <div className="text-3xl text-foreground mb-2">50</div>
              <div className="text-sm text-muted-foreground">Max Connections</div>
            </div>
            <div className="text-center p-4 bg-muted rounded border border-border">
              <div className="text-3xl text-primary mb-2">24%</div>
              <div className="text-sm text-muted-foreground">Usage</div>
            </div>
          </div>
        </Card>
      </TabsContent>

      {/* CG Servers Status Tab */}
      <TabsContent value="cg-servers" className="space-y-4">
        {/* CG Servers Overview */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Tổng Servers</div>
              <Server className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl text-foreground">{cgServers.length}</div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Online</div>
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl text-green-400">
              {cgServers.filter(s => s.status === 'online').length}
            </div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Channels Active</div>
              <Play className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl text-foreground">
              {cgServers.reduce((sum, s) => sum + s.channels.active, 0)}
            </div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Avg Latency</div>
              <Network className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl text-foreground">
              {Math.round(cgServers.reduce((sum, s) => sum + s.performance.latency, 0) / cgServers.length)} ms
            </div>
          </Card>
        </div>

        {/* CG Servers List */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-primary" />
              <h3 className="text-primary">Server CG</h3>
            </div>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </div>

          <div className="space-y-4">
            {cgServers.map((server) => (
              <div key={server.id} className="p-5 bg-muted rounded-lg border border-border">
                {/* Server Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Server className={`w-5 h-5 ${server.status === 'online' ? 'text-green-400' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="text-foreground">{server.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {server.host}:{server.port} • {server.version}
                      </div>
                    </div>
                  </div>
                  {getCGStatusBadge(server.status)}
                </div>

                {/* Server Info Grid */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-background rounded border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Uptime</div>
                    <div className="text-sm text-foreground">{server.uptime}</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Channels</div>
                    <div className="text-sm text-foreground">
                      {server.channels.active}/{server.channels.total}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-background rounded border border-border">
                    <div className="text-xs text-muted-foreground mb-1">FPS</div>
                    <div className="text-sm text-foreground">{server.performance.fps}</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Latency</div>
                    <div className="text-sm text-foreground">{server.performance.latency} ms</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">CPU Usage</span>
                      <span className="text-foreground">{server.performance.cpu}%</span>
                    </div>
                    <Progress value={server.performance.cpu} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Memory</span>
                      <span className="text-foreground">{server.performance.memory} MB</span>
                    </div>
                    <Progress value={(server.performance.memory / 2048) * 100} className="h-1.5" />
                  </div>
                </div>

                {/* Last Sync */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Last sync: {server.lastSync}
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                    <Settings className="w-3 h-3 mr-1" />
                    Cấu hình
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}