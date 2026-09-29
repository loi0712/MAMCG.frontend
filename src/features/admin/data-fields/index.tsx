import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Save, AlertCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface DataField {
  id: string;
  name: string;
  fieldGroup: string;
  dataType: string;
  isRequired: boolean;
  isSearchable: boolean;
  isEditable: boolean;
  order: number;
  dropdownOptions?: string[];
}

const mockDataFields: DataField[] = [
  {
    id: 'title',
    name: 'Tiêu đề',
    fieldGroup: 'Thông tin cơ bản',
    dataType: 'Text',
    isRequired: true,
    isSearchable: true,
    isEditable: true,
    order: 1
  },
  {
    id: 'description',
    name: 'Mô tả',
    fieldGroup: 'Thông tin cơ bản',
    dataType: 'Text Area',
    isRequired: false,
    isSearchable: true,
    isEditable: true,
    order: 2
  },
  {
    id: 'created_date',
    name: 'Ngày tạo',
    fieldGroup: 'Thông tin cơ bản',
    dataType: 'Date',
    isRequired: true,
    isSearchable: false,
    isEditable: false,
    order: 3
  },
  {
    id: 'duration',
    name: 'Thời lượng',
    fieldGroup: 'Metadata kỹ thuật',
    dataType: 'Time',
    isRequired: false,
    isSearchable: false,
    isEditable: true,
    order: 4
  },
  {
    id: 'resolution',
    name: 'Độ phân giải',
    fieldGroup: 'Metadata kỹ thuật',
    dataType: 'Dropdown',
    isRequired: false,
    isSearchable: true,
    isEditable: true,
    order: 5,
    dropdownOptions: ['4K (2160p)', '1080p (Full HD)', '720p (HD)', '480p (SD)', '360p']
  },
  {
    id: 'video_codec',
    name: 'Codec Video',
    fieldGroup: 'Metadata kỹ thuật',
    dataType: 'Text',
    isRequired: false,
    isSearchable: false,
    isEditable: false,
    order: 6
  },
  {
    id: 'frame_rate',
    name: 'Frame Rate',
    fieldGroup: 'Metadata kỹ thuật',
    dataType: 'Number',
    isRequired: false,
    isSearchable: false,
    isEditable: false,
    order: 7
  },
  {
    id: 'author',
    name: 'Tác giả',
    fieldGroup: 'Thông tin bản quyền',
    dataType: 'Text',
    isRequired: false,
    isSearchable: true,
    isEditable: true,
    order: 8
  },
  {
    id: 'copyright',
    name: 'Bản quyền',
    fieldGroup: 'Thông tin bản quyền',
    dataType: 'Text',
    isRequired: false,
    isSearchable: true,
    isEditable: true,
    order: 9
  },
  {
    id: 'category',
    name: 'Danh mục',
    fieldGroup: 'Phân loại nội dung',
    dataType: 'Multi Select',
    isRequired: false,
    isSearchable: true,
    isEditable: true,
    order: 10,
    dropdownOptions: ['Tin tức', 'Phóng sự', 'Phim tài liệu', 'Giải trí', 'Thể thao']
  },
  {
    id: 'tags',
    name: 'Tags',
    fieldGroup: 'Phân loại nội dung',
    dataType: 'Tags',
    isRequired: false,
    isSearchable: true,
    isEditable: true,
    order: 11
  },
  {
    id: 'director',
    name: 'Đạo diễn',
    fieldGroup: 'Thông tin sản xuất',
    dataType: 'Text',
    isRequired: false,
    isSearchable: true,
    isEditable: true,
    order: 12
  },
  {
    id: 'is_published',
    name: 'Đã xuất bản',
    fieldGroup: 'Thông tin cơ bản',
    dataType: 'Boolean',
    isRequired: false,
    isSearchable: false,
    isEditable: true,
    order: 13
  },
  {
    id: 'thumbnail_url',
    name: 'Ảnh đại diện',
    fieldGroup: 'Thông tin cơ bản',
    dataType: 'File Upload',
    isRequired: false,
    isSearchable: false,
    isEditable: true,
    order: 14
  },
];

export function DataFieldsView() {
  const [dataFields, setDataFields] = useState<DataField[]>(mockDataFields);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [editingField, setEditingField] = useState<DataField | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<DataField | null>(null);

  // Form state
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formFieldGroup, setFormFieldGroup] = useState('');
  const [formDataType, setFormDataType] = useState('');
  const [formOrder, setFormOrder] = useState('1');
  const [formIsRequired, setFormIsRequired] = useState(false);
  const [formIsSearchable, setFormIsSearchable] = useState(false);
  const [formIsEditable, setFormIsEditable] = useState(true);
  
  // Dropdown options state
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');
  
  const [idError, setIdError] = useState('');
  const [nameError, setNameError] = useState('');

  const filteredFields = dataFields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === 'all' || field.fieldGroup === groupFilter;
    return matchesSearch && matchesGroup;
  });

  const fieldGroups = Array.from(new Set(dataFields.map(f => f.fieldGroup)));

  // Check if the selected data type requires dropdown options
  const requiresDropdownOptions = (dataType: string) => {
    return ['Dropdown', 'Multi Select', 'Select'].includes(dataType);
  };

  const validateId = (value: string) => {
    if (!value) {
      setIdError('ID không được để trống');
      return false;
    }
    
    const exists = dataFields.some(f => 
      f.id === value && f.id !== editingField?.id
    );
    
    if (exists) {
      setIdError('ID này đã tồn tại. Vui lòng chọn ID khác.');
      return false;
    }
    
    if (!/^[a-z0-9_]+$/.test(value)) {
      setIdError('ID chỉ được chứa chữ thường, số và dấu gạch dưới');
      return false;
    }
    
    setIdError('');
    return true;
  };

  const validateName = (value: string) => {
    if (!value) {
      setNameError('Tên trường không được để trống');
      return false;
    }
    
    const exists = dataFields.some(f => 
      f.name === value && f.id !== editingField?.id
    );
    
    if (exists) {
      setNameError('Tên này đã tồn tại. Vui lòng chọn tên khác.');
      return false;
    }
    
    setNameError('');
    return true;
  };

  const handleEdit = (field: DataField) => {
    setEditingField(field);
    setFormId(field.id);
    setFormName(field.name);
    setFormFieldGroup(field.fieldGroup);
    setFormDataType(field.dataType);
    setFormOrder(field.order.toString());
    setFormIsRequired(field.isRequired);
    setFormIsSearchable(field.isSearchable);
    setFormIsEditable(field.isEditable);
    setDropdownOptions(field.dropdownOptions || []);
    setIdError('');
    setNameError('');
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const isIdValid = validateId(formId);
    const isNameValid = validateName(formName);
    
    if (!isIdValid || !isNameValid) {
      return;
    }

    if (!formFieldGroup || !formDataType) {
      toast.error('Vui lòng điền đầy đủ thông tin', {
        description: 'Nhóm trường và Kiểu dữ liệu là bắt buộc'
      });
      return;
    }

    // Check if dropdown options are required but not provided
    if (requiresDropdownOptions(formDataType) && dropdownOptions.length === 0) {
      toast.error('Vui lòng thêm các tùy chọn', {
        description: 'Kiểu dữ liệu này yêu cầu ít nhất một tùy chọn'
      });
      return;
    }

    const newField: DataField = {
      id: formId,
      name: formName,
      fieldGroup: formFieldGroup,
      dataType: formDataType,
      isRequired: formIsRequired,
      isSearchable: formIsSearchable,
      isEditable: formIsEditable,
      order: parseInt(formOrder) || 1,
      ...(requiresDropdownOptions(formDataType) && { dropdownOptions })
    };

    if (editingField) {
      setDataFields(dataFields.map(f => f.id === editingField.id ? newField : f));
      toast.success('Đã cập nhật trường dữ liệu', {
        description: `Trường "${formName}" đã được cập nhật`
      });
    } else {
      setDataFields([...dataFields, newField]);
      toast.success('Đã thêm trường dữ liệu', {
        description: `Trường "${formName}" đã được thêm vào hệ thống`
      });
    }
    
    setIsDialogOpen(false);
    setEditingField(null);
    resetForm();
  };

  const resetForm = () => {
    setFormId('');
    setFormName('');
    setFormFieldGroup('');
    setFormDataType('');
    setFormOrder('1');
    setFormIsRequired(false);
    setFormIsSearchable(false);
    setFormIsEditable(true);
    setDropdownOptions([]);
    setNewOptionInput('');
    setIdError('');
    setNameError('');
  };

  const addDropdownOption = () => {
    if (newOptionInput.trim()) {
      if (!dropdownOptions.includes(newOptionInput.trim())) {
        setDropdownOptions([...dropdownOptions, newOptionInput.trim()]);
        setNewOptionInput('');
      } else {
        toast.error('Tùy chọn đã tồn tại', {
          description: 'Vui lòng nhập tùy chọn khác'
        });
      }
    }
  };

  const removeDropdownOption = (index: number) => {
    setDropdownOptions(dropdownOptions.filter((_, i) => i !== index));
  };

  const getDataTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'Text': 'border-blue-500 text-blue-400',
      'Text Area': 'border-blue-500 text-blue-400',
      'Rich Text': 'border-indigo-500 text-indigo-400',
      'Number': 'border-green-500 text-green-400',
      'Decimal': 'border-green-500 text-green-400',
      'Date': 'border-purple-500 text-purple-400',
      'Time': 'border-purple-500 text-purple-400',
      'DateTime': 'border-purple-500 text-purple-400',
      'Dropdown': 'border-yellow-500 text-yellow-400',
      'Select': 'border-yellow-500 text-yellow-400',
      'Multi Select': 'border-yellow-500 text-yellow-400',
      'Tags': 'border-primary text-primary',
      'Boolean': 'border-pink-500 text-pink-400',
      'File Upload': 'border-orange-500 text-orange-400',
      'Email': 'border-teal-500 text-teal-400',
      'URL': 'border-teal-500 text-teal-400',
      'JSON': 'border-red-500 text-red-400',
    };
    return <Badge variant="outline" className={`${colors[type] || 'border-border text-muted-foreground'} text-[10px]`}>{type}</Badge>;
  };

  const handleDelete = (field: DataField) => {
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fieldToDelete) {
      setDataFields(dataFields.filter(f => f.id !== fieldToDelete.id));
      toast.success('Đã xóa trường dữ liệu', {
        description: `Trường "${fieldToDelete.name}" đã được xóa thành công`
      });
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm trường dữ liệu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-border text-foreground"
          />
        </div>

        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-64 bg-muted border-border text-foreground">
            <SelectValue placeholder="Lọc theo nhóm" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-foreground">Tất cả nhóm</SelectItem>
            {fieldGroups.map(group => (
              <SelectItem key={group} value={group} className="text-foreground">{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingField(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm trường
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-primary">
                {editingField ? 'Chỉnh sửa trường dữ liệu' : 'Thêm trường dữ liệu mới'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Điền đầy đủ thông tin để tạo hoặc chỉnh sửa trường dữ liệu
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">ID *</Label>
                  <Input 
                    placeholder="vd: title"
                    value={formId}
                    onChange={(e) => {
                      setFormId(e.target.value);
                      validateId(e.target.value);
                    }}
                    onBlur={(e) => validateId(e.target.value)}
                    className={`bg-muted border-border text-foreground ${idError ? 'border-red-500' : ''}`}
                    disabled={!!editingField}
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
                  <Label className="text-foreground">Tên trường *</Label>
                  <Input 
                    placeholder="Nhập tên trường"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Nhóm trường *</Label>
                  <Select value={formFieldGroup} onValueChange={setFormFieldGroup}>
                    <SelectTrigger className="bg-muted border-border text-foreground">
                      <SelectValue placeholder="Chọn nhóm" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {fieldGroups.map(group => (
                        <SelectItem key={group} value={group} className="text-foreground">{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Kiểu dữ liệu *</Label>
                  <Select value={formDataType} onValueChange={(value) => {
                    setFormDataType(value);
                    // Reset dropdown options if changing from a dropdown type
                    if (!requiresDropdownOptions(value)) {
                      setDropdownOptions([]);
                    }
                  }}>
                    <SelectTrigger className="bg-muted border-border text-foreground">
                      <SelectValue placeholder="Chọn kiểu" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-80">
                      <SelectItem value="Text" className="text-foreground">Text - Văn bản ngắn</SelectItem>
                      <SelectItem value="Text Area" className="text-foreground">Text Area - Văn bản dài</SelectItem>
                      <SelectItem value="Rich Text" className="text-foreground">Rich Text - Soạn thảo định dạng</SelectItem>
                      <SelectItem value="Number" className="text-foreground">Number - Số nguyên</SelectItem>
                      <SelectItem value="Decimal" className="text-foreground">Decimal - Số thập phân</SelectItem>
                      <SelectItem value="Date" className="text-foreground">Date - Ngày tháng</SelectItem>
                      <SelectItem value="Time" className="text-foreground">Time - Thời gian</SelectItem>
                      <SelectItem value="DateTime" className="text-foreground">DateTime - Ngày giờ</SelectItem>
                      <SelectItem value="Dropdown" className="text-foreground">Dropdown - Chọn một</SelectItem>
                      <SelectItem value="Multi Select" className="text-foreground">Multi Select - Chọn nhiều</SelectItem>
                      <SelectItem value="Tags" className="text-foreground">Tags - Nhãn</SelectItem>
                      <SelectItem value="Boolean" className="text-foreground">Boolean - Đúng/Sai</SelectItem>
                      <SelectItem value="File Upload" className="text-foreground">File Upload - Tải file</SelectItem>
                      <SelectItem value="Email" className="text-foreground">Email - Địa chỉ email</SelectItem>
                      <SelectItem value="URL" className="text-foreground">URL - Đường dẫn</SelectItem>
                      <SelectItem value="JSON" className="text-foreground">JSON - Dữ liệu JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dropdown Options - Show only for Dropdown, Multi Select types */}
              {requiresDropdownOptions(formDataType) && (
                <div className="space-y-3 p-4 bg-muted rounded border border-border">
                  <Label className="text-foreground">Tùy chọn Dropdown *</Label>
                  <p className="text-xs text-muted-foreground">Thêm các tùy chọn cho dropdown/select</p>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Nhập tùy chọn mới..."
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addDropdownOption();
                        }
                      }}
                      className="bg-card border-border text-foreground flex-1"
                    />
                    <Button 
                      type="button"
                      onClick={addDropdownOption}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {dropdownOptions.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <Label className="text-muted-foreground text-xs">Danh sách tùy chọn ({dropdownOptions.length}):</Label>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {dropdownOptions.map((option, index) => (
                          <div key={index} className="flex items-center justify-between bg-card p-2 rounded border border-border">
                            <span className="text-sm text-foreground">{option}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDropdownOption(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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

              <div className="space-y-3 p-4 bg-muted rounded border border-border">
                <Label className="text-foreground">Tùy chọn</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox 
                      checked={formIsRequired}
                      onCheckedChange={(checked) => setFormIsRequired(checked as boolean)}
                      className="border-border data-[state=checked]:bg-primary" 
                    />
                    <span className="text-sm text-muted-foreground">Bắt buộc</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox 
                      checked={formIsSearchable}
                      onCheckedChange={(checked) => setFormIsSearchable(checked as boolean)}
                      className="border-border data-[state=checked]:bg-primary" 
                    />
                    <span className="text-sm text-muted-foreground">Có thể tìm kiếm</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox 
                      checked={formIsEditable}
                      onCheckedChange={(checked) => setFormIsEditable(checked as boolean)}
                      className="border-border data-[state=checked]:bg-primary" 
                    />
                    <span className="text-sm text-muted-foreground">Có thể chỉnh sửa</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingField(null);
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
                  {editingField ? 'Cập nhật' : 'Tạo trường'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Fields Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card border-border hover:bg-card">
              <TableHead className="text-muted-foreground w-12">STT</TableHead>
              <TableHead className="text-muted-foreground w-40">ID</TableHead>
              <TableHead className="text-muted-foreground">Tên trường</TableHead>
              <TableHead className="text-muted-foreground">Nhóm trường</TableHead>
              <TableHead className="text-muted-foreground w-36">Kiểu dữ liệu</TableHead>
              <TableHead className="text-muted-foreground w-24 text-center">Bắt buộc</TableHead>
              <TableHead className="text-muted-foreground w-24 text-center">Tìm kiếm</TableHead>
              <TableHead className="text-muted-foreground w-24 text-center">Sửa được</TableHead>
              <TableHead className="text-muted-foreground w-32 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFields.map((field, index) => (
              <TableRow key={field.id} className="border-border hover:bg-accent">
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="text-primary text-xs font-mono">{field.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-foreground">{field.name}</span>
                    {field.dropdownOptions && field.dropdownOptions.length > 0 && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {field.dropdownOptions.length} tùy chọn
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{field.fieldGroup}</TableCell>
                <TableCell>{getDataTypeBadge(field.dataType)}</TableCell>
                <TableCell className="text-center">
                  {field.isRequired ? (
                    <Badge variant="outline" className="border-red-500 text-red-400 text-[10px]">✓</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {field.isSearchable ? (
                    <Badge variant="outline" className="border-green-500 text-green-400 text-[10px]">✓</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {field.isEditable ? (
                    <Badge variant="outline" className="border-blue-500 text-blue-400 text-[10px]">✓</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(field)}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(field)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Xác nhận xóa trường dữ liệu
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa trường dữ liệu này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2 py-4">
            <div className="p-3 bg-muted rounded border border-border">
              <p className="text-sm text-muted-foreground">Tên trường:</p>
              <p className="text-foreground font-bold">{fieldToDelete?.name}</p>
            </div>
            <Alert className="bg-red-900/20 border-red-500">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400 text-xs ml-2">
                Hành động này không thể hoàn tác
              </AlertDescription>
            </Alert>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">
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
  );
}