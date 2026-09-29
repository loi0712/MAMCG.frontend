import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Server, Monitor, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  user?: string;
  ip?: string;
  userAgent?: string;
}

interface CGServerLog {
  id: string;
  timestamp: string;
  serverName: string;
  serverId: string;
  level: 'info' | 'warning' | 'error';
  channel?: number;
  message: string;
  details?: string;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2025-10-29 14:32:15',
    level: 'success',
    category: 'Media',
    message: 'Tải lên thành công 5 video files',
    user: 'Nguyễn Văn An',
    ip: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0'
  },
  {
    id: '2',
    timestamp: '2025-10-29 13:45:22',
    level: 'info',
    category: 'User',
    message: 'Người dùng đăng nhập vào hệ thống',
    user: 'Trần Thị Bình',
    ip: '192.168.1.112',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/120.0'
  },
  {
    id: '3',
    timestamp: '2025-10-29 13:18:09',
    level: 'success',
    category: 'Metadata',
    message: 'Cập nhật metadata cho 12 clips',
    user: 'Trần Thị Bình',
    ip: '192.168.1.112',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/120.0'
  },
  {
    id: '4',
    timestamp: '2025-10-29 12:30:45',
    level: 'warning',
    category: 'Storage',
    message: 'Dung lượng lưu trữ primary đạt 75%',
    user: 'System'
  },
  {
    id: '5',
    timestamp: '2025-10-29 11:45:33',
    level: 'success',
    category: 'System',
    message: 'Backup database hoàn tất',
    user: 'System'
  },
  {
    id: '6',
    timestamp: '2025-10-29 11:20:18',
    level: 'error',
    category: 'Database',
    message: 'Kết nối database bị timeout, đã tự động kết nối lại',
    user: 'System'
  },
  {
    id: '7',
    timestamp: '2025-10-29 10:22:56',
    level: 'info',
    category: 'Permission',
    message: 'Tạo nhóm quyền mới: "Editor Team"',
    user: 'Lê Văn Cường',
    ip: '192.168.1.98',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.0'
  },
  {
    id: '8',
    timestamp: '2025-10-29 09:15:42',
    level: 'success',
    category: 'Storage',
    message: 'Kết nối storage archive thành công',
    user: 'System'
  },
  {
    id: '9',
    timestamp: '2025-10-29 08:30:11',
    level: 'info',
    category: 'User',
    message: 'Người dùng đăng xuất khỏi hệ thống',
    user: 'Phạm Thị Dung',
    ip: '192.168.1.87',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/119.0.0.0'
  },
  {
    id: '10',
    timestamp: '2025-10-29 07:45:29',
    level: 'warning',
    category: 'Security',
    message: 'Phát hiện 3 lần đăng nhập thất bại liên tiếp',
    ip: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/119.0.0.0'
  },
];

const mockCGLogs: CGServerLog[] = [
  {
    id: 'cg-1',
    timestamp: '2025-10-30 14:25:30',
    serverName: 'CG Server - Studio A',
    serverId: 'cg-1',
    level: 'info',
    channel: 1,
    message: 'Template loaded successfully',
    details: 'Template: NEWS_LOWER_THIRD'
  },
  {
    id: 'cg-2',
    timestamp: '2025-10-30 14:23:15',
    serverName: 'CG Server - Studio A',
    serverId: 'cg-1',
    level: 'info',
    channel: 2,
    message: 'Playback started',
    details: 'File: intro_animation.mp4'
  },
  {
    id: 'cg-3',
    timestamp: '2025-10-30 14:20:42',
    serverName: 'CG Server - Studio B',
    serverId: 'cg-2',
    level: 'warning',
    channel: 1,
    message: 'Frame dropped',
    details: 'Dropped 3 frames due to high CPU usage'
  },
  {
    id: 'cg-4',
    timestamp: '2025-10-30 14:18:55',
    serverName: 'CG Server - Studio A',
    serverId: 'cg-1',
    level: 'info',
    message: 'Channel initialized',
    details: 'Channel 1-4 ready'
  },
  {
    id: 'cg-5',
    timestamp: '2025-10-30 14:15:22',
    serverName: 'CG Server - Backup',
    serverId: 'cg-3',
    level: 'error',
    message: 'Connection failed',
    details: 'Unable to connect to server at 192.168.1.103:5250'
  },
  {
    id: 'cg-6',
    timestamp: '2025-10-30 14:12:08',
    serverName: 'CG Server - Studio B',
    serverId: 'cg-2',
    level: 'info',
    channel: 3,
    message: 'Media file loaded',
    details: 'File: background_loop.mov'
  },
  {
    id: 'cg-7',
    timestamp: '2025-10-30 14:10:33',
    serverName: 'CG Server - Studio A',
    serverId: 'cg-1',
    level: 'info',
    channel: 1,
    message: 'Template updated',
    details: 'Data: {"name":"John Doe","title":"Reporter"}'
  },
  {
    id: 'cg-8',
    timestamp: '2025-10-30 14:08:15',
    serverName: 'CG Server - Studio B',
    serverId: 'cg-2',
    level: 'warning',
    message: 'High memory usage detected',
    details: 'Memory: 1.8GB / 2GB (90%)'
  },
];

export function LogsView() {
  const [activeTab, setActiveTab] = useState('system');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cgServerFilter, setCGServerFilter] = useState('all');
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [cgLogs, setCGLogs] = useState<CGServerLog[]>(mockCGLogs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const filteredCGLogs = cgLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.serverName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesServer = cgServerFilter === 'all' || log.serverId === cgServerFilter;
    return matchesSearch && matchesLevel && matchesServer;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLogs([...mockLogs]);
      setCGLogs([...mockCGLogs]);
      toast.success('Đã làm mới nhật ký', {
        description: `Tải lại ${mockLogs.length} logs thành công`
      });
    } catch {
      toast.error('Lỗi khi làm mới nhật ký');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    const dataToExport = activeTab === 'system' ? filteredLogs : filteredCGLogs;
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs_${activeTab}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Đã xuất file logs', {
      description: `${dataToExport.length} logs đã được export`
    });
  };

  const handleClearLogs = () => {
    setIsClearDialogOpen(true);
  };

  const confirmClearLogs = () => {
    if (activeTab === 'system') {
      setLogs([]);
      toast.success('Đã xóa tất cả nhật ký hệ thống', {
        description: `${logs.length} logs đã được xóa`
      });
    } else {
      setCGLogs([]);
      toast.success('Đã xóa tất cả nhật ký CG Server', {
        description: `${cgLogs.length} logs đã được xóa`
      });
    }
    setIsClearDialogOpen(false);
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    const config = {
      info: { label: 'Info', className: 'border-blue-500 text-blue-400' },
      success: { label: 'Success', className: 'border-green-500 text-green-400' },
      warning: { label: 'Warning', className: 'border-yellow-500 text-yellow-400' },
      error: { label: 'Error', className: 'border-red-500 text-red-400' },
    };
    const cfg = config[level];
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
  };

  const getBrowserIcon = (userAgent?: string) => {
    if (!userAgent) return null;
    
    if (userAgent.includes('Chrome')) return '🌐 Chrome';
    if (userAgent.includes('Firefox')) return '🦊 Firefox';
    if (userAgent.includes('Safari')) return '🧭 Safari';
    if (userAgent.includes('Edge')) return '🌊 Edge';
    return '🖥️ Browser';
  };

  const getOSFromUserAgent = (userAgent?: string) => {
    if (!userAgent) return null;
    
    if (userAgent.includes('Windows NT')) return 'Windows';
    if (userAgent.includes('Mac OS X')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown OS';
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="system">
            <Monitor className="w-4 h-4 mr-2" />
            Nhật ký Hệ thống
          </TabsTrigger>
          <TabsTrigger value="cg-servers">
            <Server className="w-4 h-4 mr-2" />
            Nhật ký Server CG
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="border-border text-foreground hover:bg-accent flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
          </Button>
          <Button 
            onClick={handleClearLogs}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-900/20 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Xóa logs
          </Button>
        </div>
      </div>

      {/* System Logs Tab */}
      <TabsContent value="system" className="space-y-4">
        {/* Filters */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm kiếm trong nhật ký..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted border-border text-foreground"
              />
            </div>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40 bg-muted border-border text-foreground">
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="text-foreground">Tất cả</SelectItem>
                <SelectItem value="info" className="text-foreground">Info</SelectItem>
                <SelectItem value="success" className="text-foreground">Success</SelectItem>
                <SelectItem value="warning" className="text-foreground">Warning</SelectItem>
                <SelectItem value="error" className="text-foreground">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-muted border-border text-foreground">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="text-foreground">Tất cả</SelectItem>
                <SelectItem value="System" className="text-foreground">System</SelectItem>
                <SelectItem value="User" className="text-foreground">User</SelectItem>
                <SelectItem value="Media" className="text-foreground">Media</SelectItem>
                <SelectItem value="Database" className="text-foreground">Database</SelectItem>
                <SelectItem value="Storage" className="text-foreground">Storage</SelectItem>
                <SelectItem value="Security" className="text-foreground">Security</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </Card>

        {/* Logs Table */}
        <Card className="bg-card border-border">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="border-border hover:bg-card">
                  <TableHead className="text-muted-foreground w-40">Thời gian</TableHead>
                  <TableHead className="text-muted-foreground w-24">Mức độ</TableHead>
                  <TableHead className="text-muted-foreground w-32">Danh mục</TableHead>
                  <TableHead className="text-muted-foreground">Nội dung</TableHead>
                  <TableHead className="text-muted-foreground w-36">Người dùng</TableHead>
                  <TableHead className="text-muted-foreground w-32">IP</TableHead>
                  <TableHead className="text-muted-foreground w-36">User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-accent">
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {log.timestamp}
                    </TableCell>
                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{log.message}</TableCell>
                    <TableCell className="text-muted-foreground">{log.user || '-'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {log.ip || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {log.userAgent ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col gap-1">
                                <span className="text-foreground">{getBrowserIcon(log.userAgent)}</span>
                                <span className="text-muted-foreground text-[10px]">{getOSFromUserAgent(log.userAgent)}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md bg-card border-border">
                              <p className="text-xs text-foreground break-all">{log.userAgent}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </TabsContent>

      {/* CG Server Logs Tab */}
      <TabsContent value="cg-servers" className="space-y-4">
        {/* Filters */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm kiếm trong nhật ký CG Server..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted border-border text-foreground"
              />
            </div>
            
            <Select value={cgServerFilter} onValueChange={setCGServerFilter}>
              <SelectTrigger className="w-48 bg-muted border-border text-foreground">
                <SelectValue placeholder="Server" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="text-foreground">Tất cả Servers</SelectItem>
                <SelectItem value="cg-1" className="text-foreground">CG Server - Studio A</SelectItem>
                <SelectItem value="cg-2" className="text-foreground">CG Server - Studio B</SelectItem>
                <SelectItem value="cg-3" className="text-foreground">CG Server - Backup</SelectItem>
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40 bg-muted border-border text-foreground">
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="text-foreground">Tất cả</SelectItem>
                <SelectItem value="info" className="text-foreground">Info</SelectItem>
                <SelectItem value="warning" className="text-foreground">Warning</SelectItem>
                <SelectItem value="error" className="text-foreground">Error</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </Card>

        {/* CG Server Logs Table */}
        <Card className="bg-card border-border">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="border-border hover:bg-card">
                  <TableHead className="text-muted-foreground w-40">Thời gian</TableHead>
                  <TableHead className="text-muted-foreground w-24">Mức độ</TableHead>
                  <TableHead className="text-muted-foreground w-48">Server</TableHead>
                  <TableHead className="text-muted-foreground w-24">Channel</TableHead>
                  <TableHead className="text-muted-foreground">Message</TableHead>
                  <TableHead className="text-muted-foreground w-64">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCGLogs.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-accent">
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {log.timestamp}
                    </TableCell>
                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <Server className="w-3 h-3 text-primary" />
                        {log.serverName}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-center">
                      {log.channel ? (
                        <Badge variant="outline" className="border-primary text-primary">
                          CH {log.channel}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-foreground">{log.message}</TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {log.details || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </TabsContent>

      {/* Clear Logs Confirmation Dialog */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">Xác nhận xóa logs</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Bạn có chắc chắn muốn xóa tất cả {activeTab === 'system' ? 'nhật ký hệ thống' : 'nhật ký CG Server'}?
              <br />
              <span className="text-red-400">Hành động này không thể hoàn tác.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClearLogs}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
}