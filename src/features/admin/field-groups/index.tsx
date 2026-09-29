import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Save, GripVertical, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  
  
  AlertDialogContent, 
  
  
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface DataField {
  id: string;
  name: string;
  dataType: string;
  isRequired: boolean;
  isSearchable: boolean;
}

interface FieldGroup {
  id: string;
  name: string;
  description: string;
  fieldCount: number;
  order: number;
  isActive: boolean;
  fields?: DataField[];
}

const mockFields: Record<string, DataField[]> = {
  basic_info: [
    { id: 'title', name: 'Tiêu đề', dataType: 'text', isRequired: true, isSearchable: true },
    { id: 'description', name: 'Mô tả', dataType: 'textarea', isRequired: false, isSearchable: true },
    { id: 'date_created', name: 'Ngày tạo', dataType: 'date', isRequired: true, isSearchable: false },
    { id: 'duration', name: 'Thời lượng', dataType: 'number', isRequired: false, isSearchable: false },
    { id: 'language', name: 'Ngôn ngữ', dataType: 'select', isRequired: false, isSearchable: true },
    { id: 'location', name: 'Địa điểm', dataType: 'text', isRequired: false, isSearchable: true },
    { id: 'keywords', name: 'Từ khóa', dataType: 'tags', isRequired: false, isSearchable: true },
    { id: 'status', name: 'Trạng thái', dataType: 'select', isRequired: true, isSearchable: false },
  ],
  technical_metadata: [
    { id: 'video_codec', name: 'Video Codec', dataType: 'text', isRequired: false, isSearchable: false },
    { id: 'audio_codec', name: 'Audio Codec', dataType: 'text', isRequired: false, isSearchable: false },
    { id: 'resolution', name: 'Độ phân giải', dataType: 'text', isRequired: false, isSearchable: false },
    { id: 'bitrate', name: 'Bitrate', dataType: 'number', isRequired: false, isSearchable: false },
    { id: 'frame_rate', name: 'Frame Rate', dataType: 'number', isRequired: false, isSearchable: false },
    { id: 'aspect_ratio', name: 'Tỷ lệ khung hình', dataType: 'text', isRequired: false, isSearchable: false },
    { id: 'file_size', name: 'Kích thước file', dataType: 'number', isRequired: false, isSearchable: false },
    { id: 'format', name: 'Định dạng', dataType: 'text', isRequired: false, isSearchable: true },
    { id: 'audio_channels', name: 'Audio Channels', dataType: 'number', isRequired: false, isSearchable: false },
    { id: 'sample_rate', name: 'Sample Rate', dataType: 'number', isRequired: false, isSearchable: false },
    { id: 'color_space', name: 'Color Space', dataType: 'text', isRequired: false, isSearchable: false },
    { id: 'timecode', name: 'Timecode', dataType: 'text', isRequired: false, isSearchable: false },
  ],
  copyright_info: [
    { id: 'copyright_holder', name: 'Chủ sở hữu bản quyền', dataType: 'text', isRequired: false, isSearchable: true },
    { id: 'license_type', name: 'Loại giấy phép', dataType: 'select', isRequired: false, isSearchable: true },
    { id: 'usage_rights', name: 'Quyền sử dụng', dataType: 'textarea', isRequired: false, isSearchable: false },
    { id: 'expiry_date', name: 'Ngày hết hạn', dataType: 'date', isRequired: false, isSearchable: false },
    { id: 'author', name: 'Tác giả', dataType: 'text', isRequired: false, isSearchable: true },
    { id: 'credit', name: 'Credit', dataType: 'text', isRequired: false, isSearchable: true },
  ],
  content_classification: [
    { id: 'category', name: 'Danh mục', dataType: 'select', isRequired: true, isSearchable: true },
    { id: 'genre', name: 'Thể loại', dataType: 'multiselect', isRequired: false, isSearchable: true },
    { id: 'tags', name: 'Tags', dataType: 'tags', isRequired: false, isSearchable: true },
    { id: 'subject', name: 'Chủ đề', dataType: 'text', isRequired: false, isSearchable: true },
    { id: 'rating', name: 'Đánh giá', dataType: 'select', isRequired: false, isSearchable: false },
    { id: 'audience', name: 'Đối tượng', dataType: 'select', isRequired: false, isSearchable: true },
    { id: 'content_type', name: 'Loại nội dung', dataType: 'select', isRequired: false, isSearchable: true },
    { id: 'priority', name: 'Độ ưu tiên', dataType: 'select', isRequired: false, isSearchable: false },
    { id: 'sensitivity', name: 'Độ nhạy cảm', dataType: 'select', isRequired: false, isSearchable: false },
    { id: 'custom_tags', name: 'Tags tùy chỉnh', dataType: 'tags', isRequired: false, isSearchable: true },
  ],
  production_info: [
    { id: 'producer', name: 'Nhà sản xuất', dataType: 'text', isRequired: false, isSearchable: true },
    { id: 'director', name: 'Đạo diễn', dataType: 'text', isRequired: false, isSearchable: true },
    { id: 'editor', name: 'Biên tập viên', dataType: 'text', isRequired: false, isSearchable: true },
    { id: 'camera_operator', name: 'Quay phim', dataType: 'text', isRequired: false, isSearchable: true },
    { id: 'production_date', name: 'Ngày sản xuất', dataType: 'date', isRequired: false, isSearchable: false },
    { id: 'production_unit', name: 'Đơn vị sản xuất', dataType: 'text', isRequired: false, isSearchable: true },
    { id: 'production_notes', name: 'Ghi chú sản xuất', dataType: 'textarea', isRequired: false, isSearchable: false },
  ],
  storage_archiving: [
    { id: 'storage_location', name: 'Vị trí lưu trữ', dataType: 'text', isRequired: false, isSearchable: false },
    { id: 'archive_status', name: 'Trạng thái lưu trữ', dataType: 'select', isRequired: false, isSearchable: false },
    { id: 'backup_location', name: 'Vị trí backup', dataType: 'text', isRequired: false, isSearchable: false },
    { id: 'retention_period', name: 'Thời gian lưu trữ', dataType: 'number', isRequired: false, isSearchable: false },
    { id: 'archive_date', name: 'Ngày lưu trữ', dataType: 'date', isRequired: false, isSearchable: false },
  ],
};

const mockFieldGroups: FieldGroup[] = [
  {
    id: 'basic_info',
    name: 'Thông tin cơ bản',
    description: 'Các trường thông tin cơ bản của media',
    fieldCount: 8,
    order: 1,
    isActive: true,
    fields: mockFields.basic_info
  },
  {
    id: 'technical_metadata',
    name: 'Metadata kỹ thuật',
    description: 'Thông tin kỹ thuật về video, audio, codec',
    fieldCount: 12,
    order: 2,
    isActive: true,
    fields: mockFields.technical_metadata
  },
  {
    id: 'copyright_info',
    name: 'Thông tin bản quyền',
    description: 'Thông tin về bản quyền, tác giả, license',
    fieldCount: 6,
    order: 3,
    isActive: true,
    fields: mockFields.copyright_info
  },
  {
    id: 'content_classification',
    name: 'Phân loại nội dung',
    description: 'Danh mục, thể loại, tags, keywords',
    fieldCount: 10,
    order: 4,
    isActive: true,
    fields: mockFields.content_classification
  },
  {
    id: 'production_info',
    name: 'Thông tin sản xuất',
    description: 'Đơn vị sản xuất, đạo diễn, biên tập viên',
    fieldCount: 7,
    order: 5,
    isActive: true,
    fields: mockFields.production_info
  },
  {
    id: 'storage_archiving',
    name: 'Lưu trữ & Archiving',
    description: 'Thông tin lưu trữ, vị trí, backup',
    fieldCount: 5,
    order: 6,
    isActive: false,
    fields: mockFields.storage_archiving
  },
];

export function FieldGroupsView() {
  const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>(mockFieldGroups);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGroup, setEditingGroup] = useState<FieldGroup | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<FieldGroup | null>(null);
  
  // Form state
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOrder, setFormOrder] = useState('');
  
  // Validation errors
  const [idError, setIdError] = useState('');
  const [nameError, setNameError] = useState('');

  const filteredGroups = fieldGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getDataTypeBadge = (dataType: string) => {
    const config: Record<string, { label: string; className: string }> = {
      text: { label: 'Text', className: 'border-blue-500 text-blue-400' },
      textarea: { label: 'Textarea', className: 'border-purple-500 text-purple-400' },
      number: { label: 'Number', className: 'border-green-500 text-green-400' },
      date: { label: 'Date', className: 'border-orange-500 text-orange-400' },
      select: { label: 'Select', className: 'border-primary text-primary' },
      multiselect: { label: 'Multi-Select', className: 'border-pink-500 text-pink-400' },
      tags: { label: 'Tags', className: 'border-yellow-500 text-yellow-400' },
    };
    const cfg = config[dataType] || { label: dataType, className: 'border-border text-muted-foreground' };
    return <Badge variant="outline" className={`${cfg.className} text-[10px]`}>{cfg.label}</Badge>;
  };

  const handleEdit = (group: FieldGroup) => {
    setEditingGroup(group);
    setFormId(group.id);
    setFormName(group.name);
    setFormDescription(group.description);
    setFormOrder(group.order.toString());
    setIdError('');
    setNameError('');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const group = fieldGroups.find(g => g.id === id);
    if (group) {
      setGroupToDelete(group);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (groupToDelete) {
      setFieldGroups(prev => prev.filter(g => g.id !== groupToDelete.id));
      toast.success('Đã xóa nhóm trường', {
        description: `Nhóm trường "${groupToDelete.name}" đã được xóa thành công`
      });
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  const validateId = (value: string) => {
    if (!value) {
      setIdError('ID không được để trống');
      return false;
    }
    
    // Check if ID already exists (excluding current editing item)
    const exists = fieldGroups.some(g => 
      g.id === value && g.id !== editingGroup?.id
    );
    
    if (exists) {
      setIdError('ID này đã tồn tại. Vui lòng chọn ID khác.');
      return false;
    }
    
    // Check ID format (only lowercase, numbers, underscore)
    if (!/^[a-z0-9_]+$/.test(value)) {
      setIdError('ID chỉ được chứa chữ thường, số và dấu gạch dưới');
      return false;
    }
    
    setIdError('');
    return true;
  };

  const validateName = (value: string) => {
    if (!value) {
      setNameError('Tên nhóm không được để trống');
      return false;
    }
    
    // Check if name already exists (excluding current editing item)
    const exists = fieldGroups.some(g => 
      g.name === value && g.id !== editingGroup?.id
    );
    
    if (exists) {
      setNameError('Tên này đã tồn tại. Vui lòng chọn tên khác.');
      return false;
    }
    
    setNameError('');
    return true;
  };

  const handleSave = () => {
    const isIdValid = validateId(formId);
    const isNameValid = validateName(formName);
    
    if (!isIdValid || !isNameValid) {
      return;
    }
    
    // Save logic here
    console.log('Saving:', { id: formId, name: formName, description: formDescription, order: formOrder });
    
    // Reset and close
    setIsDialogOpen(false);
    setEditingGroup(null);
    resetForm();
  };

  const resetForm = () => {
    setFormId('');
    setFormName('');
    setFormDescription('');
    setFormOrder('');
    setIdError('');
    setNameError('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm nhóm trường..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-border text-foreground"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingGroup(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm nhóm trường
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary">
                {editingGroup ? 'Chỉnh sửa nhóm trường' : 'Thêm nhóm trường mới'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-foreground">ID *</Label>
                <Input 
                  placeholder="vd: basic_info"
                  value={formId}
                  onChange={(e) => {
                    setFormId(e.target.value);
                    validateId(e.target.value);
                  }}
                  onBlur={(e) => validateId(e.target.value)}
                  className={`bg-muted border-border text-foreground ${idError ? 'border-red-500' : ''}`}
                  disabled={!!editingGroup}
                />
                {idError && (
                  <Alert className="bg-red-900/20 border-red-500 py-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400 text-xs ml-2">
                      {idError}
                    </AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-muted-foreground">ID duy nhất, chỉ dùng chữ thường, số và gạch dưới</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Tên nhóm trường *</Label>
                <Input 
                  placeholder="Nhập tên nhóm trường"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    validateName(e.target.value);
                  }}
                  onBlur={(e) => validateName(e.target.value)}
                  className={`bg-muted border-border text-foreground ${nameError ? 'border-red-500' : ''}`}
                />
                {nameError && (
                  <Alert className="bg-red-900/20 border-red-500 py-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400 text-xs ml-2">
                      {nameError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Mô tả</Label>
                <Textarea 
                  placeholder="Mô tả về nhóm trường này"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-muted border-border text-foreground min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Thứ tự hiển thị</Label>
                <Input 
                  type="number"
                  placeholder="1"
                  value={formOrder}
                  onChange={(e) => setFormOrder(e.target.value)}
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingGroup(null);
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
                  {editingGroup ? 'Cập nhật' : 'Tạo nhóm'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Field Groups Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card border-border hover:bg-card">
              <TableHead className="text-muted-foreground w-12"></TableHead>
              <TableHead className="text-muted-foreground w-12">STT</TableHead>
              <TableHead className="text-muted-foreground w-40">ID</TableHead>
              <TableHead className="text-muted-foreground">Tên nhóm</TableHead>
              <TableHead className="text-muted-foreground">Mô tả</TableHead>
              <TableHead className="text-muted-foreground w-32 text-center">Số trường</TableHead>
              <TableHead className="text-muted-foreground w-32 text-center">Trạng thái</TableHead>
              <TableHead className="text-muted-foreground w-32 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.map((group) => (
              <Collapsible
                key={group.id}
                open={expandedGroups.has(group.id)}
                onOpenChange={() => group.fieldCount > 0 && toggleExpand(group.id)}
                asChild
              >
                <>
                  <TableRow className="border-border hover:bg-accent">
                    <TableCell>
                      {group.fieldCount > 0 ? (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                            {expandedGroups.has(group.id) ? (
                              <ChevronDown className="w-4 h-4 text-primary" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      ) : (
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move ml-1" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{group.order}</TableCell>
                    <TableCell className="text-primary text-xs font-mono">{group.id}</TableCell>
                    <TableCell className="text-foreground">{group.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{group.description}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={group.fieldCount > 0 ? 'border-primary text-primary cursor-pointer hover:bg-primary/10' : 'border-border text-muted-foreground'}
                        onClick={() => group.fieldCount > 0 && toggleExpand(group.id)}
                      >
                        {group.fieldCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={group.isActive 
                          ? 'border-green-500 text-green-400' 
                          : 'border-border text-muted-foreground'
                        }
                      >
                        {group.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(group)}
                          className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(group.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Fields Section */}
                  {group.fields && group.fields.length > 0 && (
                    <CollapsibleContent asChild>
                      <tr>
                        <td colSpan={8} className="p-0">
                          <div className="bg-muted border-t border-border">
                            <div className="p-4">
                              <div className="text-xs text-primary mb-2 flex items-center gap-2">
                                <span>📋 Danh sách trường dữ liệu ({group.fields.length})</span>
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border hover:bg-accent">
                                    <TableHead className="text-muted-foreground text-xs w-48">Tên trường</TableHead>
                                    <TableHead className="text-muted-foreground text-xs w-32">ID</TableHead>
                                    <TableHead className="text-muted-foreground text-xs w-32">Kiểu dữ liệu</TableHead>
                                    <TableHead className="text-muted-foreground text-xs w-24 text-center">Bắt buộc</TableHead>
                                    <TableHead className="text-muted-foreground text-xs w-24 text-center">Tìm kiếm</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.fields.map((field) => (
                                    <TableRow key={field.id} className="border-border hover:bg-accent">
                                      <TableCell className="text-foreground text-sm">{field.name}</TableCell>
                                      <TableCell className="text-muted-foreground text-xs font-mono">{field.id}</TableCell>
                                      <TableCell>{getDataTypeBadge(field.dataType)}</TableCell>
                                      <TableCell className="text-center">
                                        {field.isRequired ? (
                                          <Badge variant="outline" className="border-red-500 text-red-400 text-[10px]">
                                            Có
                                          </Badge>
                                        ) : (
                                          <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {field.isSearchable ? (
                                          <Badge variant="outline" className="border-green-500 text-green-400 text-[10px]">
                                            Có
                                          </Badge>
                                        ) : (
                                          <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </CollapsibleContent>
                  )}
                </>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Info Card */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-sm text-muted-foreground">
          <strong className="text-primary">Lưu ý:</strong> Nhóm trường được sử dụng để tổ chức các trường dữ liệu thành các nhóm logic. 
          Click vào số lượng trường hoặc icon mũi tên để xem chi tiết các trường trong nhóm. 
          Thứ tự hiển thị có thể điều chỉnh bằng cách kéo thả các hàng trong bảng.
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Xác nhận xóa nhóm trường
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Bạn có chắc chắn muốn xóa nhóm trường này?</Label>
              <p className="text-xs text-muted-foreground">Nhóm trường sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
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
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
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