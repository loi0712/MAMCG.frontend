import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertCircle } from 'lucide-react';
import { NodeData } from './flowchart-node';

interface NodeConfigPanelProps {
  node: NodeData | null;
  onUpdate: (nodeId: string, updates: Partial<NodeData>) => void;
  onDelete: (nodeId: string) => void;
}

export function NodeConfigPanel({ node, onUpdate, onDelete }: NodeConfigPanelProps) {
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-3">⚙️</div>
          <div className="text-sm">Chọn một node để cấu hình</div>
          <div className="text-xs text-muted-foreground mt-2">
            Click vào node trên canvas
          </div>
        </div>
      </div>
    );
  }

  const renderNodeTypeConfig = () => {
    switch (node.type) {
      case 'start':
      case 'end':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-foreground text-xs">Kiểu kích hoạt</Label>
              <Select defaultValue="manual">
                <SelectTrigger className="bg-muted border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="manual" className="text-foreground">Thủ công</SelectItem>
                  <SelectItem value="auto" className="text-foreground">Tự động</SelectItem>
                  <SelectItem value="scheduled" className="text-foreground">Theo lịch</SelectItem>
                  <SelectItem value="webhook" className="text-foreground">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'process':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-foreground text-xs">Loại xử lý</Label>
              <Select defaultValue="transcode">
                <SelectTrigger className="bg-muted border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="transcode" className="text-foreground">Transcode Video</SelectItem>
                  <SelectItem value="thumbnail" className="text-foreground">Tạo Thumbnail</SelectItem>
                  <SelectItem value="metadata" className="text-foreground">Trích xuất Metadata</SelectItem>
                  <SelectItem value="watermark" className="text-foreground">Thêm Watermark</SelectItem>
                  <SelectItem value="custom" className="text-foreground">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground text-xs">Preset</Label>
              <Input 
                placeholder="Nhập preset..."
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <Label className="text-foreground text-xs">Xử lý song song</Label>
                <p className="text-[10px] text-muted-foreground">Cho phép chạy đồng thời</p>
              </div>
              <Switch />
            </div>
          </div>
        );

      case 'decision':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-foreground text-xs">Điều kiện</Label>
              <Select defaultValue="filesize">
                <SelectTrigger className="bg-muted border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="filesize" className="text-foreground">Kích thước file</SelectItem>
                  <SelectItem value="duration" className="text-foreground">Thời lượng</SelectItem>
                  <SelectItem value="resolution" className="text-foreground">Độ phân giải</SelectItem>
                  <SelectItem value="format" className="text-foreground">Định dạng</SelectItem>
                  <SelectItem value="metadata" className="text-foreground">Metadata</SelectItem>
                  <SelectItem value="custom" className="text-foreground">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground text-xs">Toán tử</Label>
              <Select defaultValue="greater">
                <SelectTrigger className="bg-muted border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="equal" className="text-foreground">Bằng (=)</SelectItem>
                  <SelectItem value="notequal" className="text-foreground">Khác (≠)</SelectItem>
                  <SelectItem value="greater" className="text-foreground">Lớn hơn {'(>)'}</SelectItem>
                  <SelectItem value="less" className="text-foreground">Nhỏ hơn {'(<)'}</SelectItem>
                  <SelectItem value="contains" className="text-foreground">Chứa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground text-xs">Giá trị</Label>
              <Input 
                placeholder="Nhập giá trị..."
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded p-2 flex gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-300">
                Decision node cần ít nhất 2 đường kết nối đầu ra (True/False)
              </div>
            </div>
          </div>
        );

      case 'input':
      case 'output':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-foreground text-xs">Nguồn dữ liệu</Label>
              <Select defaultValue="file">
                <SelectTrigger className="bg-muted border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="file" className="text-foreground">File upload</SelectItem>
                  <SelectItem value="folder" className="text-foreground">Folder</SelectItem>
                  <SelectItem value="url" className="text-foreground">URL</SelectItem>
                  <SelectItem value="api" className="text-foreground">API</SelectItem>
                  <SelectItem value="database" className="text-foreground">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground text-xs">Đường dẫn</Label>
              <Input 
                placeholder="/path/to/files..."
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <Label className="text-foreground text-xs">Theo dõi thư mục</Label>
                <p className="text-[10px] text-muted-foreground">Watch for changes</p>
              </div>
              <Switch />
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-foreground text-xs">Loại database</Label>
              <Select defaultValue="mysql">
                <SelectTrigger className="bg-muted border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="mysql" className="text-foreground">MySQL</SelectItem>
                  <SelectItem value="postgresql" className="text-foreground">PostgreSQL</SelectItem>
                  <SelectItem value="mongodb" className="text-foreground">MongoDB</SelectItem>
                  <SelectItem value="oracle" className="text-foreground">Oracle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground text-xs">Connection string</Label>
              <Input 
                type="password"
                placeholder="mongodb://..."
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground text-xs">Query/Collection</Label>
              <Textarea 
                placeholder="SELECT * FROM..."
                className="bg-muted border-border text-foreground mt-1 min-h-20"
              />
            </div>
          </div>
        );

      case 'notification':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-foreground text-xs">Kênh thông báo</Label>
              <Select defaultValue="email">
                <SelectTrigger className="bg-muted border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="email" className="text-foreground">Email</SelectItem>
                  <SelectItem value="slack" className="text-foreground">Slack</SelectItem>
                  <SelectItem value="teams" className="text-foreground">MS Teams</SelectItem>
                  <SelectItem value="webhook" className="text-foreground">Webhook</SelectItem>
                  <SelectItem value="sms" className="text-foreground">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground text-xs">Người nhận</Label>
              <Input 
                placeholder="email@example.com"
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground text-xs">Tiêu đề</Label>
              <Input 
                placeholder="Workflow completed"
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground text-xs">Nội dung</Label>
              <Textarea 
                placeholder="Workflow đã hoàn thành..."
                className="bg-muted border-border text-foreground mt-1 min-h-16"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
            Không có cấu hình đặc biệt cho node này
          </div>
        );
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4 pb-6">
        {/* Node Info */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-primary">Thông tin Node</h3>
            <Badge variant="outline" className="border-border text-muted-foreground text-xs">
              {node.type}
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-foreground text-xs">ID</Label>
              <Input 
                value={node.id}
                disabled
                className="bg-muted border-border text-muted-foreground mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-foreground text-xs">Tên hiển thị *</Label>
              <Input 
                value={node.label}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="Nhập tên node..."
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>

            <div>
              <Label className="text-foreground text-xs">Mô tả</Label>
              <Textarea 
                value={node.description || ''}
                onChange={(e) => onUpdate(node.id, { description: e.target.value })}
                placeholder="Mô tả chức năng..."
                className="bg-muted border-border text-foreground mt-1 min-h-16"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-muted" />

        {/* Position & Size */}
        <div>
          <h3 className="text-sm text-primary mb-3">Vị trí & Kích thước</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-foreground text-xs">X</Label>
              <Input 
                type="number"
                value={Math.round(node.x)}
                onChange={(e) => onUpdate(node.id, { x: parseFloat(e.target.value) || 0 })}
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground text-xs">Y</Label>
              <Input 
                type="number"
                value={Math.round(node.y)}
                onChange={(e) => onUpdate(node.id, { y: parseFloat(e.target.value) || 0 })}
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground text-xs">Width</Label>
              <Input 
                type="number"
                value={node.width}
                onChange={(e) => onUpdate(node.id, { width: parseFloat(e.target.value) || 100 })}
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground text-xs">Height</Label>
              <Input 
                type="number"
                value={node.height}
                onChange={(e) => onUpdate(node.id, { height: parseFloat(e.target.value) || 60 })}
                className="bg-muted border-border text-foreground mt-1"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-muted" />

        {/* Node Type Configuration */}
        <div>
          <h3 className="text-sm text-primary mb-3">Cấu hình Node</h3>
          {renderNodeTypeConfig()}
        </div>

        <Separator className="bg-muted" />

        {/* Advanced Settings */}
        <div>
          <h3 className="text-sm text-primary mb-3">Cài đặt nâng cao</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <Label className="text-foreground text-xs">Bật node</Label>
                <p className="text-[10px] text-muted-foreground">Kích hoạt node này</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <Label className="text-foreground text-xs">Retry on failure</Label>
                <p className="text-[10px] text-muted-foreground">Thử lại khi lỗi</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <Label className="text-foreground text-xs">Log output</Label>
                <p className="text-[10px] text-muted-foreground">Ghi log kết quả</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="mt-3">
            <Label className="text-foreground text-xs">Timeout (giây)</Label>
            <Input 
              type="number"
              placeholder="300"
              defaultValue="300"
              className="bg-muted border-border text-foreground mt-1"
            />
          </div>
        </div>

        <Separator className="bg-muted" />

        {/* Actions */}
        <div>
          <Button
            variant="destructive"
            onClick={() => onDelete(node.id)}
            className="w-full bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-500/50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa Node
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}