import { Button } from '@/components/ui/button';
import { Plus, Trash2, Search, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  
  
  AlertDialogContent, 
  
  
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';

interface FunctionPermission {
  id: string;
  name: string;
  category: string;
  permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    display: boolean;
    config: boolean;
  };
}

interface RoleGroup {
  id: string;
  name: string;
  description: string;
  userCount: number;
}

const mockRoleGroups: RoleGroup[] = [
  {
    id: '1',
    name: 'Quản trị viên',
    description: 'Toàn quyền truy cập hệ thống',
    userCount: 3
  },
  {
    id: '2',
    name: 'Biên tập viên',
    description: 'Quyền chỉnh sửa nội dung',
    userCount: 12
  },
  {
    id: '3',
    name: 'Người xem',
    description: 'Chỉ có quyền xem',
    userCount: 45
  },
  {
    id: '4',
    name: 'Quản lý Media',
    description: 'Quản lý toàn bộ media',
    userCount: 8
  },
  {
    id: '5',
    name: 'Moderator',
    description: 'Kiểm duyệt nội dung',
    userCount: 5
  },
];

const initialFunctionPermissions: FunctionPermission[] = [
  {
    id: 'media',
    name: 'Quản lý Media',
    category: 'Media',
    permissions: { view: true, edit: true, delete: false, display: true, config: false }
  },
  {
    id: 'upload',
    name: 'Tải lên Media',
    category: 'Media',
    permissions: { view: true, edit: true, delete: false, display: false, config: false }
  },
  {
    id: 'metadata',
    name: 'Quản lý Metadata',
    category: 'Media',
    permissions: { view: true, edit: false, delete: false, display: true, config: false }
  },
  {
    id: 'users',
    name: 'Quản lý người dùng',
    category: 'Hệ thống',
    permissions: { view: false, edit: false, delete: false, display: false, config: false }
  },
  {
    id: 'roles',
    name: 'Quản lý nhóm quyền',
    category: 'Hệ thống',
    permissions: { view: false, edit: false, delete: false, display: false, config: false }
  },
  {
    id: 'settings',
    name: 'Cài đặt hệ thống',
    category: 'Hệ thống',
    permissions: { view: false, edit: false, delete: false, display: false, config: false }
  },
  {
    id: 'database',
    name: 'Quản lý Database',
    category: 'Hệ thống',
    permissions: { view: false, edit: false, delete: false, display: false, config: false }
  },
  {
    id: 'storage',
    name: 'Quản lý lưu trữ',
    category: 'Hệ thống',
    permissions: { view: false, edit: false, delete: false, display: false, config: false }
  },
];

export function RoleGroupsView() {
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>(mockRoleGroups);
  const [selectedRole, setSelectedRole] = useState<RoleGroup | null>(roleGroups[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [functionPermissions, setFunctionPermissions] = useState<FunctionPermission[]>(initialFunctionPermissions);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleGroup | null>(null);

  const filteredRoleGroups = roleGroups.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleSelect = (role: RoleGroup) => {
    setSelectedRole(role);
  };

  const handleDeleteClick = (role: RoleGroup, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      setRoleGroups(prev => prev.filter(role => role.id !== roleToDelete.id));
      
      // If deleted role was selected, clear selection
      if (selectedRole?.id === roleToDelete.id) {
        setSelectedRole(roleGroups[0] || null);
      }
      
      toast.success('Đã xóa nhóm quyền', {
        description: `Nhóm quyền "${roleToDelete.name}" đã được xóa thành công`
      });
      
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handlePermissionToggle = (functionId: string, permissionType: keyof FunctionPermission['permissions']) => {
    setFunctionPermissions(prev => 
      prev.map(func => 
        func.id === functionId
          ? {
              ...func,
              permissions: {
                ...func.permissions,
                [permissionType]: !func.permissions[permissionType]
              }
            }
          : func
      )
    );
  };

  const groupedFunctions = functionPermissions.reduce((acc, func) => {
    if (!acc[func.category]) {
      acc[func.category] = [];
    }
    acc[func.category].push(func);
    return acc;
  }, {} as Record<string, FunctionPermission[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm nhóm quyền
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary">Thêm nhóm quyền mới</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-foreground">Tên nhóm quyền *</Label>
                <Input 
                  placeholder="Nhập tên nhóm quyền"
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Mô tả</Label>
                <Input 
                  placeholder="Mô tả về nhóm quyền"
                  className="bg-muted border-border text-foreground"
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
                  onClick={() => {
                    setIsDialogOpen(false);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Tạo nhóm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Role Groups Table */}
        <div className="col-span-5">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm kiếm nhóm quyền..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted border-border text-foreground"
              />
            </div>
          </div>
          
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-card border-border hover:bg-card">
                  <TableHead className="text-muted-foreground w-16">STT</TableHead>
                  <TableHead className="text-muted-foreground">Tên nhóm</TableHead>
                  <TableHead className="text-muted-foreground w-24">Người dùng</TableHead>
                  <TableHead className="text-muted-foreground w-16 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoleGroups.map((role, index) => (
                  <TableRow 
                    key={role.id} 
                    className={`border-border cursor-pointer transition-colors ${
                      selectedRole?.id === role.id 
                        ? 'bg-primary/10 hover:bg-primary/15' 
                        : 'hover:bg-accent'
                    }`}
                  >
                    <TableCell 
                      className="text-muted-foreground"
                      onClick={() => handleRoleSelect(role)}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell onClick={() => handleRoleSelect(role)}>
                      <div className="text-foreground">{role.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{role.description}</div>
                    </TableCell>
                    <TableCell onClick={() => handleRoleSelect(role)}>
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        {role.userCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(role, e)}
                        className="text-red-400 hover:text-red-500 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Column - Function Permissions */}
        <div className="col-span-7">
          {selectedRole ? (
            <div className="border border-border rounded-lg bg-card p-6">
              <div className="mb-4">
                <div className="text-primary mb-1">Cấu hình quyền cho: {selectedRole.name}</div>
                <div className="text-sm text-muted-foreground">{selectedRole.description}</div>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-4 pr-4">
                  {Object.entries(groupedFunctions).map(([category, functions]) => (
                    <div key={category} className="space-y-2">
                      <div className="text-sm text-muted-foreground border-b border-border pb-2">
                        {category}
                      </div>
                      {functions.map((func) => (
                        <div
                          key={func.id}
                          className="p-4 rounded-lg bg-muted border border-border"
                        >
                          <div className="text-foreground mb-3">{func.name}</div>
                          <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={func.permissions.view}
                                onCheckedChange={() => handlePermissionToggle(func.id, 'view')}
                                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <span className="text-sm text-muted-foreground">Xem</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={func.permissions.edit}
                                onCheckedChange={() => handlePermissionToggle(func.id, 'edit')}
                                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <span className="text-sm text-muted-foreground">Sửa</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={func.permissions.delete}
                                onCheckedChange={() => handlePermissionToggle(func.id, 'delete')}
                                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <span className="text-sm text-muted-foreground">Xóa</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={func.permissions.display}
                                onCheckedChange={() => handlePermissionToggle(func.id, 'display')}
                                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <span className="text-sm text-muted-foreground">Hiển thị</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={func.permissions.config}
                                onCheckedChange={() => handlePermissionToggle(func.id, 'config')}
                                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <span className="text-sm text-muted-foreground">Cấu hình</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="border border-border rounded-lg bg-card p-6">
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                Chọn một nhóm quyền để cấu hình
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">Xác nhận xóa nhóm quyền</AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Bạn có chắc chắn muốn xóa nhóm quyền này?</Label>
              <div className="text-sm text-muted-foreground">
                Nhóm quyền "{roleToDelete?.name}" sẽ bị xóa và không thể khôi phục.
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
                className="border-border text-foreground hover:bg-accent"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}