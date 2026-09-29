import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, TestTube, Save, Database, HardDrive, Calendar, Clock, Settings2, Play, Square, RefreshCw, Eye, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  host: string;
  port: string;
  database: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnection: string;
}

const mockDatabases: DatabaseConnection[] = [
  {
    id: '1',
    name: 'Main Database',
    type: 'PostgreSQL',
    host: '192.168.1.50',
    port: '5432',
    database: 'mamcg_main',
    status: 'connected',
    lastConnection: '29/10/2025 10:30:45'
  },
  {
    id: '2',
    name: 'Archive Database',
    type: 'MySQL',
    host: '192.168.1.51',
    port: '3306',
    database: 'archive_db',
    status: 'connected',
    lastConnection: '29/10/2025 09:15:22'
  },
  {
    id: '3',
    name: 'Legacy System',
    type: 'MS SQL Server',
    host: '192.168.1.52',
    port: '1433',
    database: 'legacy_db',
    status: 'disconnected',
    lastConnection: '28/10/2025 23:45:10'
  },
];

const databaseTypes = [
  { value: 'postgresql', label: 'PostgreSQL', defaultPort: '5432' },
  { value: 'mysql', label: 'MySQL', defaultPort: '3306' },
  { value: 'mssql', label: 'MS SQL Server', defaultPort: '1433' },
  { value: 'oracle', label: 'Oracle', defaultPort: '1521' },
  { value: 'mongodb', label: 'MongoDB', defaultPort: '27017' },
  { value: 'mariadb', label: 'MariaDB', defaultPort: '3306' },
];

export function DatabaseView() {
  const [databases] = useState<DatabaseConnection[]>(mockDatabases);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('postgresql');
  const [activeTab, setActiveTab] = useState('connections');

  const getStatusBadge = (status: DatabaseConnection['status']) => {
    const statusConfig = {
      connected: { label: 'Đã kết nối', className: 'border-green-500 text-green-400' },
      disconnected: { label: 'Ngắt kết nối', className: 'border-border text-muted-foreground' },
      error: { label: 'Lỗi', className: 'border-red-500 text-red-400' },
    };

    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getDefaultPort = (type: string) => {
    return databaseTypes.find(db => db.value === type)?.defaultPort || '';
  };

  return (
    <div className="space-y-4">
      {/* Main Tabs for Connections and Backup */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger 
            value="connections" 
            className="data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground"
          >
            <Database className="w-4 h-4 mr-2" />
            Kết nối Database
          </TabsTrigger>
          <TabsTrigger 
            value="backup" 
            className="data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Cấu hình Backup
          </TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4 mt-4">
          {/* Header */}
          <div className="flex items-center justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm kết nối
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-primary">Thêm kết nối cơ sở dữ liệu mới</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="bg-muted border border-border">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground">
                      Thông tin cơ bản
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground">
                      Nâng cao
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Tên kết nối *</Label>
                      <Input 
                        placeholder="Main Database"
                        className="bg-muted border-border text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Loại cơ sở dữ liệu *</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {databaseTypes.map(type => (
                            <SelectItem key={type.value} value={type.value} className="text-foreground">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Host/IP *</Label>
                        <Input 
                          placeholder="192.168.1.50"
                          className="bg-muted border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Cổng (Port) *</Label>
                        <Input 
                          placeholder={getDefaultPort(selectedType)}
                          className="bg-muted border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Tên Database *</Label>
                      <Input 
                        placeholder="database_name"
                        className="bg-muted border-border text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Username *</Label>
                      <Input 
                        placeholder="username"
                        className="bg-muted border-border text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Password *</Label>
                      <Input 
                        type="password"
                        placeholder="••••••••"
                        className="bg-muted border-border text-foreground"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Connection String</Label>
                      <Input 
                        placeholder="Tùy chỉnh connection string"
                        className="bg-muted border-border text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Max Pool Size</Label>
                        <Input 
                          placeholder="100"
                          type="number"
                          className="bg-muted border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Timeout (giây)</Label>
                        <Input 
                          placeholder="30"
                          type="number"
                          className="bg-muted border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Schema mặc định</Label>
                      <Input 
                        placeholder="public"
                        className="bg-muted border-border text-foreground"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 justify-end mt-4">
                  <Button 
                    variant="outline" 
                    className="border-border text-foreground hover:bg-accent flex items-center gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    Kiểm tra kết nối
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsDialogOpen(false);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Lưu cấu hình
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Tổng số kết nối</div>
              <div className="text-2xl text-foreground mt-2">{databases.length}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Đang hoạt động</div>
              <div className="text-2xl text-green-400 mt-2">
                {databases.filter(d => d.status === 'connected').length}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Ngắt kết nối</div>
              <div className="text-2xl text-muted-foreground mt-2">
                {databases.filter(d => d.status === 'disconnected').length}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Lỗi</div>
              <div className="text-2xl text-red-400 mt-2">
                {databases.filter(d => d.status === 'error').length}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-card border-border hover:bg-card">
                  <TableHead className="text-muted-foreground w-16">STT</TableHead>
                  <TableHead className="text-muted-foreground">Tên kết nối</TableHead>
                  <TableHead className="text-muted-foreground">Loại DB</TableHead>
                  <TableHead className="text-muted-foreground">Host</TableHead>
                  <TableHead className="text-muted-foreground">Port</TableHead>
                  <TableHead className="text-muted-foreground">Database</TableHead>
                  <TableHead className="text-muted-foreground">Trạng thái</TableHead>
                  <TableHead className="text-muted-foreground">Kết nối gần nhất</TableHead>
                  <TableHead className="text-muted-foreground text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {databases.map((db, index) => (
                  <TableRow key={db.id} className="border-border hover:bg-accent">
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="text-foreground flex items-center gap-2">
                      <Database className="w-4 h-4 text-primary" />
                      {db.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        {db.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground font-mono text-sm">{db.host}</TableCell>
                    <TableCell className="text-foreground font-mono">{db.port}</TableCell>
                    <TableCell className="text-foreground font-mono text-sm">{db.database}</TableCell>
                    <TableCell>{getStatusBadge(db.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{db.lastConnection}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-primary hover:text-foreground hover:bg-accent h-8 w-8 p-0"
                            >
                              <Settings2 className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border w-52">
                            <DropdownMenuItem 
                              className="text-foreground hover:bg-accent cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-foreground hover:bg-accent cursor-pointer"
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Chỉnh sửa cấu hình
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-foreground hover:bg-accent cursor-pointer"
                            >
                              <TestTube className="w-4 h-4 mr-2" />
                              Kiểm tra kết nối
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            {db.status === 'disconnected' ? (
                              <DropdownMenuItem 
                                className="text-green-400 hover:bg-green-900/20 cursor-pointer"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Kết nối
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-yellow-400 hover:bg-yellow-900/20 cursor-pointer"
                              >
                                <Square className="w-4 h-4 mr-2" />
                                Ngắt kết nối
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-foreground hover:bg-accent cursor-pointer"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Làm mới kết nối
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem 
                              className="text-primary hover:bg-primary/10 cursor-pointer"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Backup ngay
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem 
                              className="text-red-400 hover:bg-red-900/20 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa kết nối
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Backup Configuration */}
            <div className="space-y-4">
              <Card className="bg-card border-border p-6">
                <h3 className="text-primary mb-4 flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Cấu hình Backup tự động
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">Kích hoạt backup tự động</Label>
                    <Switch className="data-[state=checked]:bg-primary" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Database cần backup *</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="all" className="text-foreground">Tất cả databases</SelectItem>
                        <SelectItem value="1" className="text-foreground">Main Database</SelectItem>
                        <SelectItem value="2" className="text-foreground">Archive Database</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Tần suất backup *</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="hourly" className="text-foreground">Hàng giờ</SelectItem>
                        <SelectItem value="daily" className="text-foreground">Hàng ngày</SelectItem>
                        <SelectItem value="weekly" className="text-foreground">Hàng tuần</SelectItem>
                        <SelectItem value="monthly" className="text-foreground">Hàng tháng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Thời gian backup</Label>
                      <Input 
                        type="time"
                        defaultValue="02:00"
                        className="bg-muted border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Giữ lại bản backup</Label>
                      <Select defaultValue="30">
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="7" className="text-foreground">7 ngày</SelectItem>
                          <SelectItem value="30" className="text-foreground">30 ngày</SelectItem>
                          <SelectItem value="90" className="text-foreground">90 ngày</SelectItem>
                          <SelectItem value="365" className="text-foreground">1 năm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Đường dẫn lưu backup *</Label>
                    <Input 
                      placeholder="/var/backups/database"
                      defaultValue="/var/backups/database"
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Loại nén</Label>
                    <Select defaultValue="gzip">
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="none" className="text-foreground">Không nén</SelectItem>
                        <SelectItem value="gzip" className="text-foreground">GZIP</SelectItem>
                        <SelectItem value="zip" className="text-foreground">ZIP</SelectItem>
                        <SelectItem value="tar" className="text-foreground">TAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Label className="text-foreground">Gửi email thông báo</Label>
                    <Switch className="data-[state=checked]:bg-primary" />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cấu hình
                    </Button>
                    <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                      <HardDrive className="w-4 h-4 mr-2" />
                      Backup ngay
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Backup History */}
            <div className="space-y-4">
              <Card className="bg-card border-border p-6">
                <h3 className="text-primary mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Lịch sử Backup
                </h3>

                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {[
                      { date: '30/10/2025', time: '02:00:15', db: 'Main Database', size: '2.4 GB', status: 'success' },
                      { date: '29/10/2025', time: '02:00:12', db: 'Main Database', size: '2.3 GB', status: 'success' },
                      { date: '28/10/2025', time: '02:00:18', db: 'Main Database', size: '2.3 GB', status: 'success' },
                      { date: '27/10/2025', time: '02:00:10', db: 'Archive Database', size: '1.8 GB', status: 'success' },
                      { date: '26/10/2025', time: '02:00:45', db: 'Main Database', size: '2.2 GB', status: 'failed' },
                      { date: '25/10/2025', time: '02:00:08', db: 'Main Database', size: '2.2 GB', status: 'success' },
                      { date: '24/10/2025', time: '02:00:22', db: 'Archive Database', size: '1.7 GB', status: 'success' },
                      { date: '23/10/2025', time: '02:00:14', db: 'Main Database', size: '2.1 GB', status: 'success' },
                      { date: '22/10/2025', time: '02:00:19', db: 'Main Database', size: '2.1 GB', status: 'success' },
                      { date: '21/10/2025', time: '02:00:11', db: 'Archive Database', size: '1.6 GB', status: 'success' },
                    ].map((backup, index) => (
                      <div 
                        key={index}
                        className="bg-muted border border-border rounded p-3 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-foreground text-sm">{backup.db}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3" />
                              {backup.date}
                              <Clock className="w-3 h-3 ml-2" />
                              {backup.time}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={backup.status === 'success' 
                              ? 'border-green-500 text-green-400' 
                              : 'border-red-500 text-red-400'
                            }
                          >
                            {backup.status === 'success' ? 'Thành công' : 'Thất bại'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Kích thước: {backup.size}</span>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary hover:text-primary/80 h-7 px-2"
                            >
                              <HardDrive className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-400 hover:text-red-300 h-7 px-2"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}