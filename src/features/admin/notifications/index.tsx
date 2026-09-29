import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

interface Notification {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    timestamp: '2025-10-29 14:32',
    type: 'success',
    title: 'Upload hoàn tất',
    message: 'Nguyễn Văn An đã tải lên thành công 5 video files vào thư mục Projects/Q4-2025',
    read: false
  },
  {
    id: '2',
    timestamp: '2025-10-29 12:30',
    type: 'warning',
    title: 'Dung lượng lưu trữ',
    message: 'Hệ thống lưu trữ primary đã sử dụng 75% dung lượng. Vui lòng xem xét mở rộng hoặc archive dữ liệu cũ.',
    read: false
  },
  {
    id: '3',
    timestamp: '2025-10-29 11:45',
    type: 'success',
    title: 'Backup thành công',
    message: 'Tiến trình backup database tự động đã hoàn tất. File backup: db_backup_20251029_1145.sql',
    read: true
  },
  {
    id: '4',
    timestamp: '2025-10-29 11:20',
    type: 'error',
    title: 'Lỗi kết nối Database',
    message: 'Kết nối đến database bị timeout. Hệ thống đã tự động kết nối lại và hoạt động bình thường.',
    read: true
  },
  {
    id: '5',
    timestamp: '2025-10-29 10:15',
    type: 'info',
    title: 'Cập nhật hệ thống',
    message: 'Phiên bản mới v2.5.9 đã có sẵn. Xem chi tiết tại mục Cài đặt > Cập nhật hệ thống.',
    read: true
  },
  {
    id: '6',
    timestamp: '2025-10-29 09:30',
    type: 'warning',
    title: 'Đăng nhập thất bại',
    message: 'Phát hiện 3 lần đăng nhập thất bại liên tiếp từ IP 192.168.1.200. Tài khoản đã bị khóa tạm thời.',
    read: true
  },
  {
    id: '7',
    timestamp: '2025-10-29 08:00',
    type: 'info',
    title: 'Bảo trì định kỳ',
    message: 'Bảo trì hệ thống định kỳ sẽ được thực hiện vào 02:00 AM ngày 30/10/2025. Dự kiến thời gian: 30 phút.',
    read: true
  },
  {
    id: '8',
    timestamp: '2025-10-28 16:45',
    type: 'success',
    title: 'Storage mới được thêm',
    message: 'Storage archive (SAN) đã được kết nối thành công. Dung lượng: 50TB.',
    read: true
  },
];

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    const config = {
      info: { Icon: Info, className: 'text-blue-400' },
      success: { Icon: CheckCircle, className: 'text-green-400' },
      warning: { Icon: AlertTriangle, className: 'text-yellow-400' },
      error: { Icon: XCircle, className: 'text-red-400' },
    };
    const { Icon, className } = config[type];
    return <Icon className={`w-5 h-5 ${className}`} />;
  };

  const getTypeBadge = (type: Notification['type']) => {
    const config = {
      info: { label: 'Thông tin', className: 'border-blue-500 text-blue-400' },
      success: { label: 'Thành công', className: 'border-green-500 text-green-400' },
      warning: { label: 'Cảnh báo', className: 'border-yellow-500 text-yellow-400' },
      error: { label: 'Lỗi', className: 'border-red-500 text-red-400' },
    };
    const cfg = config[type];
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-primary">Thông báo hệ thống</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} thông báo chưa đọc
            </p>
          </div>
        </div>
        <Button
          onClick={markAllAsRead}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={unreadCount === 0}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[700px]">
        <div className="space-y-3 pr-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-border p-4 transition-all ${
                notification.read
                  ? 'bg-card'
                  : 'bg-muted border-l-4 border-l-cyan-500'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-foreground">{notification.title}</h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeBadge(notification.type)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-muted-foreground hover:text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  {!notification.read && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-primary hover:text-primary/80 p-0 h-auto mt-2"
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}