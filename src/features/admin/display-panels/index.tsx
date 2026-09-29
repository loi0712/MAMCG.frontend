import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Save, Eye, Grid3x3, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface DisplayPanel {
  id: string;
  name: string;
  description: string;
  fieldGroups: string[];
  isDefault: boolean;
  isActive: boolean;
}

const mockDisplayPanels: DisplayPanel[] = [
  {
    id: '1',
    name: 'Panel xem nhanh',
    description: 'Hiển thị các thông tin cơ bản và preview media',
    fieldGroups: ['Thông tin cơ bản', 'Metadata kỹ thuật'],
    isDefault: true,
    isActive: true
  },
  {
    id: '2',
    name: 'Panel biên tập',
    description: 'Dành cho biên tập viên chỉnh sửa metadata đầy đủ',
    fieldGroups: ['Thông tin cơ bản', 'Metadata kỹ thuật', 'Phân loại nội dung', 'Thông tin sản xuất'],
    isDefault: false,
    isActive: true
  },
  {
    id: '3',
    name: 'Panel bản quyền',
    description: 'Quản lý thông tin bản quyền và licensing',
    fieldGroups: ['Thông tin cơ bản', 'Thông tin bản quyền'],
    isDefault: false,
    isActive: true
  },
  {
    id: '4',
    name: 'Panel kỹ thuật',
    description: 'Xem chi tiết thông tin kỹ thuật của media',
    fieldGroups: ['Metadata kỹ thuật'],
    isDefault: false,
    isActive: true
  },
  {
    id: '5',
    name: 'Panel archive',
    description: 'Thông tin lưu trữ và archiving',
    fieldGroups: ['Thông tin cơ bản', 'Lưu trữ & Archiving'],
    isDefault: false,
    isActive: false
  },
];

const availableFieldGroups = [
  'Thông tin cơ bản',
  'Metadata kỹ thuật',
  'Thông tin bản quyền',
  'Phân loại nội dung',
  'Thông tin sản xuất',
  'Lưu trữ & Archiving',
];

export function DisplayPanelsView() {
  const [displayPanels, setDisplayPanels] = useState<DisplayPanel[]>(mockDisplayPanels);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPanel, setEditingPanel] = useState<DisplayPanel | null>(null);
  const [deletingPanel, setDeletingPanel] = useState<DisplayPanel | null>(null);
  const [selectedFieldGroups, setSelectedFieldGroups] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
    isActive: true,
  });

  const filteredPanels = displayPanels.filter(panel =>
    panel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    panel.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isDefault: false,
      isActive: true,
    });
    setSelectedFieldGroups([]);
    setEditingPanel(null);
  };

  const handleEdit = (panel: DisplayPanel) => {
    setEditingPanel(panel);
    setFormData({
      name: panel.name,
      description: panel.description,
      isDefault: panel.isDefault,
      isActive: panel.isActive,
    });
    setSelectedFieldGroups(panel.fieldGroups);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên panel');
      return;
    }

    if (selectedFieldGroups.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nhóm trường');
      return;
    }

    if (editingPanel) {
      // Update existing panel
      setDisplayPanels(prev => prev.map(p => 
        p.id === editingPanel.id 
          ? { ...p, ...formData, fieldGroups: selectedFieldGroups }
          : p
      ));
      toast.success('Đã cập nhật panel hiển thị', {
        description: `Panel "${formData.name}" đã được cập nhật`
      });
    } else {
      // Add new panel
      const newPanel: DisplayPanel = {
        id: `${Date.now()}`,
        ...formData,
        fieldGroups: selectedFieldGroups,
      };
      setDisplayPanels(prev => [...prev, newPanel]);
      toast.success('Đã thêm panel hiển thị mới', {
        description: `Panel "${formData.name}" đã được tạo`
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteClick = (panel: DisplayPanel) => {
    setDeletingPanel(panel);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingPanel) return;
    
    setDisplayPanels(prev => prev.filter(p => p.id !== deletingPanel.id));
    toast.success('Đã xóa panel hiển thị', {
      description: `Panel "${deletingPanel.name}" đã được xóa`
    });
    setIsDeleteDialogOpen(false);
    setDeletingPanel(null);
  };

  const toggleFieldGroup = (group: string) => {
    setSelectedFieldGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm panel hiển thị..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted border-border text-foreground"
            />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted border border-border rounded p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-accent text-primary' : 'text-muted-foreground'}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-accent text-primary' : 'text-muted-foreground'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm panel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary">
                {editingPanel ? 'Chỉnh sửa panel hiển thị' : 'Thêm panel hiển thị mới'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-foreground">Tên panel *</Label>
                <Input 
                  placeholder="Nhập tên panel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Mô tả</Label>
                <Input 
                  placeholder="Mô tả về panel này"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Chọn nhóm trường hiển thị *</Label>
                <ScrollArea className="h-48 border border-border rounded p-3 bg-muted">
                  <div className="space-y-2">
                    {availableFieldGroups.map((group) => (
                      <label
                        key={group}
                        className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedFieldGroups.includes(group)}
                          onCheckedChange={() => toggleFieldGroup(group)}
                          className="border-border data-[state=checked]:bg-primary"
                        />
                        <span className="text-sm text-foreground">{group}</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
                <div className="text-xs text-muted-foreground">
                  Đã chọn: {selectedFieldGroups.length} nhóm trường
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-muted rounded border border-border">
                  <Checkbox
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked === true })}
                    className="border-border data-[state=checked]:bg-primary"
                  />
                  <div>
                    <span className="text-sm text-foreground">Đặt làm panel mặc định</span>
                    <p className="text-xs text-muted-foreground mt-1">Panel này sẽ được hiển thị khi mở media lần đầu</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="border-border text-foreground hover:bg-accent"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingPanel ? 'Cập nhật' : 'Tạo panel'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-border text-foreground max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-primary">
                Xác nhận xóa panel hiển thị
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Bạn có chắc muốn xóa panel hiển thị này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="border-border text-foreground hover:bg-accent"
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDelete}
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Display Panels - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 gap-4">
          {filteredPanels.map((panel) => (
            <Card key={panel.id} className="bg-card border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-foreground">{panel.name}</h3>
                    {panel.isDefault && (
                      <Badge variant="outline" className="border-primary text-primary text-xs">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{panel.description}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={panel.isActive 
                    ? 'border-green-500 text-green-400' 
                    : 'border-border text-muted-foreground'
                  }
                >
                  {panel.isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Badge>
              </div>

              <div className="mb-4">
                <div className="text-xs text-muted-foreground mb-2">Nhóm trường hiển thị:</div>
                <div className="flex flex-wrap gap-2">
                  {panel.fieldGroups.map((group, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="border-border text-muted-foreground text-xs"
                    >
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-foreground hover:bg-accent"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem trước
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(panel)}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(panel)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Display Panels - List View */}
      {viewMode === 'list' && (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-card border-border hover:bg-card">
                <TableHead className="text-muted-foreground w-12">STT</TableHead>
                <TableHead className="text-muted-foreground">Tên panel</TableHead>
                <TableHead className="text-muted-foreground">Mô tả</TableHead>
                <TableHead className="text-muted-foreground w-48">Nhóm trường</TableHead>
                <TableHead className="text-muted-foreground w-32 text-center">Trạng thái</TableHead>
                <TableHead className="text-muted-foreground w-32 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPanels.map((panel, index) => (
                <TableRow key={panel.id} className="border-border hover:bg-accent">
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{panel.name}</span>
                      {panel.isDefault && (
                        <Badge variant="outline" className="border-primary text-primary text-xs">
                          Mặc định
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{panel.description}</TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {panel.fieldGroups.length} nhóm
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant="outline" 
                      className={panel.isActive 
                        ? 'border-green-500 text-green-400' 
                        : 'border-border text-muted-foreground'
                      }
                    >
                      {panel.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(panel)}
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(panel)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
      )}

      {/* Info Card */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-sm text-muted-foreground">
          <strong className="text-primary">Lưu ý:</strong> Panel hiển thị xác định những nhóm trường nào sẽ được hiển thị 
          khi người dùng xem chi tiết media. Bạn có thể tạo nhiều panel khác nhau cho từng vai trò hoặc mục đích sử dụng.
        </div>
      </div>
    </div>
  );
}