import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, TestTube, Save, HardDrive, Cloud, FolderOpen, Settings2, Eye, Play, Square, RefreshCw, BarChart3, Eraser } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface StorageConnection {
  id: string;
  name: string;
  type: 'NAS' | 'SAN' | 'FTP' | 'Amazon S3' | 'Wasabi' | 'Azure Blob' | 'Google Cloud';
  host: string;
  path: string;
  capacity: string;
  used: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnection: string;
}

const mockStorage: StorageConnection[] = [
  {
    id: '1',
    name: 'Main NAS Storage',
    type: 'NAS',
    host: '192.168.1.100',
    path: '/volume1/media',
    capacity: '10 TB',
    used: '6.5 TB',
    status: 'connected',
    lastConnection: '29/10/2025 10:30:45'
  },
  {
    id: '2',
    name: 'Amazon S3 Backup',
    type: 'Amazon S3',
    host: 's3.amazonaws.com',
    path: 'mamcg-backup',
    capacity: 'Unlimited',
    used: '2.3 TB',
    status: 'connected',
    lastConnection: '29/10/2025 09:15:22'
  },
  {
    id: '3',
    name: 'Legacy FTP Server',
    type: 'FTP',
    host: '192.168.1.150',
    path: '/archive',
    capacity: '5 TB',
    used: '4.8 TB',
    status: 'disconnected',
    lastConnection: '28/10/2025 23:45:10'
  },
  {
    id: '4',
    name: 'Wasabi Cold Storage',
    type: 'Wasabi',
    host: 's3.wasabisys.com',
    path: 'mamcg-archive',
    capacity: 'Unlimited',
    used: '8.2 TB',
    status: 'connected',
    lastConnection: '29/10/2025 08:00:00'
  },
];

const storageTypes = [
  { value: 'nas', label: 'NAS (Network Attached Storage)', icon: HardDrive },
  { value: 'san', label: 'SAN (Storage Area Network)', icon: HardDrive },
  { value: 'ftp', label: 'FTP/SFTP Server', icon: FolderOpen },
  { value: 's3', label: 'Amazon S3', icon: Cloud },
  { value: 'wasabi', label: 'Wasabi Cloud Storage', icon: Cloud },
  { value: 'azure', label: 'Azure Blob Storage', icon: Cloud },
  { value: 'gcs', label: 'Google Cloud Storage', icon: Cloud },
];

export function StorageView() {
  const [storages] = useState<StorageConnection[]>(mockStorage);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('nas');
  const [useSSL, setUseSSL] = useState(false);

  const getStatusBadge = (status: StorageConnection['status']) => {
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

  const getTypeIcon = (type: string) => {
    const isCloud = ['Amazon S3', 'Wasabi', 'Azure Blob', 'Google Cloud'].includes(type);
    return isCloud ? (
      <Cloud className="w-4 h-4 text-blue-400" />
    ) : (
      <HardDrive className="w-4 h-4 text-primary" />
    );
  };

  const renderConnectionFields = () => {
    const isCloud = ['s3', 'wasabi', 'azure', 'gcs'].includes(selectedType);
    const isFTP = selectedType === 'ftp';

    if (isCloud) {
      return (
        <>
          <div className="space-y-2">
            <Label className="text-foreground">Bucket/Container Name *</Label>
            <Input 
              placeholder="my-bucket-name"
              className="bg-muted border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Access Key ID *</Label>
            <Input 
              placeholder="AKIAIOSFODNN7EXAMPLE"
              className="bg-muted border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Secret Access Key *</Label>
            <Input 
              type="password"
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              className="bg-muted border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Region</Label>
            <Input 
              placeholder="us-east-1"
              className="bg-muted border-border text-foreground"
            />
          </div>
        </>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-foreground">Host/IP *</Label>
            <Input 
              placeholder="192.168.1.100"
              className="bg-muted border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Cổng (Port)</Label>
            <Input 
              placeholder={isFTP ? "21" : "445"}
              className="bg-muted border-border text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Đường dẫn *</Label>
          <Input 
            placeholder="/volume1/media"
            className="bg-muted border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Username</Label>
          <Input 
            placeholder="username"
            className="bg-muted border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Password</Label>
          <Input 
            type="password"
            placeholder="••••••••"
            className="bg-muted border-border text-foreground"
          />
        </div>

        {isFTP && (
          <div className="flex items-center justify-between p-4 bg-muted rounded border border-border">
            <div>
              <Label className="text-foreground">Sử dụng SFTP (SSH)</Label>
              <p className="text-xs text-muted-foreground mt-1">Kết nối bảo mật qua SSH</p>
            </div>
            <Switch 
              checked={useSSL}
              onCheckedChange={setUseSSL}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm hệ thống lưu trữ
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary">Thêm hệ thống lưu trữ mới</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="bg-muted border border-border">
                <TabsTrigger value="basic" className="data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground">
                  Thông tin kết nối
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground">
                  Cấu hình nâng cao
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Tên hệ thống lưu trữ *</Label>
                  <Input 
                    placeholder="Main Storage"
                    className="bg-muted border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Loại lưu trữ *</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="bg-muted border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {storageTypes.map(type => (
                        <SelectItem key={type.value} value={type.value} className="text-foreground">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {renderConnectionFields()}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Dung lượng tối đa (GB)</Label>
                    <Input 
                      placeholder="10000"
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
                  <Label className="text-foreground">Mount Point (Local)</Label>
                  <Input 
                    placeholder="/mnt/storage"
                    className="bg-muted border-border text-foreground"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded border border-border">
                  <div>
                    <Label className="text-foreground">Tự động kết nối khi khởi động</Label>
                    <p className="text-xs text-muted-foreground mt-1">Tự động mount khi hệ thống khởi động</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-primary" />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded border border-border">
                  <div>
                    <Label className="text-foreground">Sử dụng làm lưu trữ mặc định</Label>
                    <p className="text-xs text-muted-foreground mt-1">Lưu trữ chính cho file mới</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-primary" />
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
          <div className="text-sm text-muted-foreground">Tổng số lưu trữ</div>
          <div className="text-2xl text-foreground mt-2">{storages.length}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Đang hoạt động</div>
          <div className="text-2xl text-green-400 mt-2">
            {storages.filter(s => s.status === 'connected').length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Tổng dung lượng</div>
          <div className="text-2xl text-primary mt-2">35 TB</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Đã sử dụng</div>
          <div className="text-2xl text-yellow-400 mt-2">21.8 TB</div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card border-border hover:bg-card">
              <TableHead className="text-muted-foreground w-16">STT</TableHead>
              <TableHead className="text-muted-foreground">Tên hệ thống</TableHead>
              <TableHead className="text-muted-foreground">Loại</TableHead>
              <TableHead className="text-muted-foreground">Host/Endpoint</TableHead>
              <TableHead className="text-muted-foreground">Đường dẫn</TableHead>
              <TableHead className="text-muted-foreground">Dung lượng</TableHead>
              <TableHead className="text-muted-foreground">Đã dùng</TableHead>
              <TableHead className="text-muted-foreground">Trạng thái</TableHead>
              <TableHead className="text-muted-foreground text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storages.map((storage, index) => (
              <TableRow key={storage.id} className="border-border hover:bg-accent">
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="text-foreground flex items-center gap-2">
                  {getTypeIcon(storage.type)}
                  {storage.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-purple-500 text-purple-400">
                    {storage.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground font-mono text-sm">{storage.host}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{storage.path}</TableCell>
                <TableCell className="text-foreground">{storage.capacity}</TableCell>
                <TableCell className="text-yellow-400">{storage.used}</TableCell>
                <TableCell>{getStatusBadge(storage.status)}</TableCell>
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
                      <DropdownMenuContent align="end" className="bg-card border-border w-56">
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
                        <DropdownMenuItem 
                          className="text-foreground hover:bg-accent cursor-pointer"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Xem thống kê usage
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        {storage.status === 'disconnected' ? (
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
                          Đồng bộ storage
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem 
                          className="text-orange-400 hover:bg-orange-900/20 cursor-pointer"
                        >
                          <Eraser className="w-4 h-4 mr-2" />
                          Dọn dẹp storage
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem 
                          className="text-red-400 hover:bg-red-900/20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa storage
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
    </div>
  );
}