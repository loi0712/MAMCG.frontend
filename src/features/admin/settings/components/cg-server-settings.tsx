import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface CGServer {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  port: string;
  description?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnection: string;
}

const mockServers: CGServer[] = [
  {
    id: '1',
    name: 'CG Server 1',
    location: 'Phòng Server chính - Tầng 3',
    ipAddress: '192.168.1.100',
    port: '8080',
    description: 'Server CG chính cho sản xuất',
    status: 'connected',
    lastConnection: '29/10/2025 10:30:45'
  },
  {
    id: '2',
    name: 'CG Server 2',
    location: 'Phòng Kỹ thuật - Tầng 2',
    ipAddress: '192.168.1.101',
    port: '8080',
    description: 'Server CG dự phòng',
    status: 'connected',
    lastConnection: '29/10/2025 09:15:22'
  },
  {
    id: '3',
    name: 'CG Backup Server',
    location: 'Data Center - Tòa B',
    ipAddress: '192.168.1.102',
    port: '8080',
    description: 'Server backup và lưu trữ',
    status: 'disconnected',
    lastConnection: '28/10/2025 23:45:10'
  },
];

export function CGServerSettings() {
  const [servers, setServers] = useState<CGServer[]>(mockServers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<CGServer | null>(null);
  const [editingServer, setEditingServer] = useState<CGServer | null>(null);
  const [newServer, setNewServer] = useState<CGServer>({
    id: '',
    name: '',
    location: '',
    ipAddress: '',
    port: '',
    description: '',
    status: 'connected',
    lastConnection: new Date().toISOString(),
  });

  const getStatusBadge = (status: CGServer['status']) => {
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

  const handleAddServer = () => {
    if (!newServer.name || !newServer.ipAddress || !newServer.port) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    const newId = (servers.length + 1).toString();
    const serverToAdd: CGServer = {
      ...newServer,
      id: newId,
      lastConnection: new Date().toISOString(),
    };
    setServers([...servers, serverToAdd]);
    setNewServer({
      id: '',
      name: '',
      location: '',
      ipAddress: '',
      port: '',
      description: '',
      status: 'connected',
      lastConnection: new Date().toISOString(),
    });
    setIsDialogOpen(false);
    toast.success('Server đã được thêm thành công');
  };

  const handleDeleteServer = () => {
    if (!selectedServer) return;
    const updatedServers = servers.filter(server => server.id !== selectedServer.id);
    setServers(updatedServers);
    setIsDeleteDialogOpen(false);
    toast.success('Server đã được xóa thành công');
  };

  const handleEditServer = () => {
    if (!editingServer) return;
    const updatedServers = servers.map(server => 
      server.id === editingServer.id ? editingServer : server
    );
    setServers(updatedServers);
    setIsEditDialogOpen(false);
    toast.success('Server đã được cập nhật thành công');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-primary">Danh sách CG Server</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý kết nối với các CG Server
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm Server
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-primary">Thêm CG Server mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-foreground">Tên Server *</Label>
                <Input 
                  placeholder="CG Server 1"
                  className="bg-muted border-border text-foreground"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Địa chỉ IP *</Label>
                <Input 
                  placeholder="192.168.1.100"
                  className="bg-muted border-border text-foreground"
                  value={newServer.ipAddress}
                  onChange={(e) => setNewServer({ ...newServer, ipAddress: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Port *</Label>
                <Input 
                  placeholder="8080"
                  className="bg-muted border-border text-foreground"
                  value={newServer.port}
                  onChange={(e) => setNewServer({ ...newServer, port: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Mô tả</Label>
                <Textarea 
                  placeholder="Mô tả về server"
                  className="bg-muted border-border text-foreground"
                  value={newServer.description}
                  onChange={(e) => setNewServer({ ...newServer, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Vị trí</Label>
                <Input 
                  placeholder="Vị trí của server"
                  className="bg-muted border-border text-foreground"
                  value={newServer.location}
                  onChange={(e) => setNewServer({ ...newServer, location: e.target.value })}
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-border text-foreground hover:bg-accent"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleAddServer}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Thêm Server
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Tổng số Server</div>
          <div className="text-2xl text-foreground mt-2">{servers.length}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Đang hoạt động</div>
          <div className="text-2xl text-green-400 mt-2">
            {servers.filter(s => s.status === 'connected').length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Ngắt kết nối</div>
          <div className="text-2xl text-muted-foreground mt-2">
            {servers.filter(s => s.status === 'disconnected').length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Lỗi</div>
          <div className="text-2xl text-red-400 mt-2">
            {servers.filter(s => s.status === 'error').length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card border-border hover:bg-card">
              <TableHead className="text-muted-foreground w-16">STT</TableHead>
              <TableHead className="text-muted-foreground">Tên Server</TableHead>
              <TableHead className="text-muted-foreground">Vị trí đặt Server</TableHead>
              <TableHead className="text-muted-foreground">Địa chỉ IP</TableHead>
              <TableHead className="text-muted-foreground">Port</TableHead>
              <TableHead className="text-muted-foreground">Trạng thái</TableHead>
              <TableHead className="text-muted-foreground">Kết nối gần nhất</TableHead>
              <TableHead className="text-muted-foreground text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map((server, index) => (
              <TableRow key={server.id} className="border-border hover:bg-accent">
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="text-foreground">{server.name}</TableCell>
                <TableCell className="text-foreground">{server.location}</TableCell>
                <TableCell className="text-foreground font-mono">{server.ipAddress}</TableCell>
                <TableCell className="text-foreground font-mono">{server.port}</TableCell>
                <TableCell>{getStatusBadge(server.status)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{server.lastConnection}</TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:text-primary/80 hover:bg-accent"
                      onClick={() => {
                        setEditingServer(server);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-300 hover:bg-accent"
                      onClick={() => {
                        setSelectedServer(server);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-primary">Chỉnh sửa Server</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Tên Server *</Label>
              <Input 
                placeholder="CG Server 1"
                className="bg-muted border-border text-foreground"
                value={editingServer?.name || ''}
                onChange={(e) => setEditingServer({ ...editingServer!, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Địa chỉ IP *</Label>
              <Input 
                placeholder="192.168.1.100"
                className="bg-muted border-border text-foreground"
                value={editingServer?.ipAddress || ''}
                onChange={(e) => setEditingServer({ ...editingServer!, ipAddress: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Port *</Label>
              <Input 
                placeholder="8080"
                className="bg-muted border-border text-foreground"
                value={editingServer?.port || ''}
                onChange={(e) => setEditingServer({ ...editingServer!, port: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Mô tả</Label>
              <Textarea 
                placeholder="Mô tả về server"
                className="bg-muted border-border text-foreground"
                value={editingServer?.description || ''}
                onChange={(e) => setEditingServer({ ...editingServer!, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Vị trí</Label>
              <Input 
                placeholder="Vị trí của server"
                className="bg-muted border-border text-foreground"
                value={editingServer?.location || ''}
                onChange={(e) => setEditingServer({ ...editingServer!, location: e.target.value })}
              />
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="border-border text-foreground hover:bg-accent"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleEditServer}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Cập nhật Server
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">Xóa Server</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa server này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-border text-foreground hover:bg-accent"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteServer}
            >
              Xóa Server
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}