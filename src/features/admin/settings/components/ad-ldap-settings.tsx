import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Save, TestTube, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function ADLDAPSettings() {
  const [connectionType, setConnectionType] = useState('ad');
  const [useSSL, setUseSSL] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [ldapConfig] = useState({
    enabled: false,
    host: '',
    port: 389,
    baseDN: '',
    bindDN: '',
    bindPassword: '',
    userSearchFilter: '',
    ssl: false,
  });

  const handleTestConnection = async () => {
    if (!ldapConfig.host || !ldapConfig.baseDN) {
      toast.error('Vui lòng nhập đầy đủ thông tin', {
        description: 'Địa chỉ server và Base DN là bắt buộc'
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Kết nối LDAP thành công!', {
        description: 'Tìm thấy 125 người dùng trong hệ thống'
      });
    } catch {
      toast.error('Kết nối thất bại', {
        description: 'Kiểm tra lại host, port và credentials'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!ldapConfig.host || !ldapConfig.baseDN) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Đã lưu cấu hình AD/LDAP', {
        description: 'Các thay đổi đã được áp dụng'
      });
    } catch {
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Đồng bộ người dùng thành công!', {
        description: 'Đã thêm 12 người dùng mới, cập nhật 35 người dùng'
      });
    } catch {
      toast.error('Đồng bộ thất bại', {
        description: 'Vui lòng kiểm tra lại kết nối'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-primary">Cấu hình kết nối AD/LDAP</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cấu hình kết nối với Active Directory hoặc LDAP server
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-muted hover:bg-accent text-foreground flex items-center gap-2" onClick={handleTestConnection} disabled={isTestingConnection}>
            {isTestingConnection ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
            Kiểm tra kết nối
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2" onClick={handleSaveConfig} disabled={isSaving}>
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu cấu hình
          </Button>
        </div>
      </div>

      {/* Connection Type Selection */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-primary mb-4">Loại kết nối</h3>
        <RadioGroup value={connectionType} onValueChange={setConnectionType}>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ad" id="ad" className="border-border text-primary" />
              <Label htmlFor="ad" className="text-foreground cursor-pointer">
                Active Directory (AD)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ldap" id="ldap" className="border-border text-primary" />
              <Label htmlFor="ldap" className="text-foreground cursor-pointer">
                LDAP
              </Label>
            </div>
          </div>
        </RadioGroup>
      </Card>

      {/* Connection Configuration */}
      <Card className="bg-card border-border p-6">
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="connection" className="data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground">
              Thông tin kết nối
            </TabsTrigger>
            <TabsTrigger value="authentication" className="data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground">
              Xác thực
            </TabsTrigger>
            <TabsTrigger value="mapping" className="data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground">
              Ánh xạ thuộc tính
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Địa chỉ Server *</Label>
                <Input 
                  placeholder={connectionType === 'ad' ? 'dc.company.com' : 'ldap.company.com'}
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Cổng (Port) *</Label>
                <Input 
                  placeholder={useSSL ? '636' : '389'}
                  className="bg-muted border-border text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Base DN *</Label>
              <Input 
                placeholder="DC=company,DC=com"
                className="bg-muted border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">Distinguished Name gốc để tìm kiếm người dùng</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded border border-border">
              <div>
                <Label className="text-foreground">Sử dụng SSL/TLS</Label>
                <p className="text-xs text-muted-foreground mt-1">Kết nối bảo mật qua SSL/TLS</p>
              </div>
              <Switch 
                checked={useSSL}
                onCheckedChange={setUseSSL}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {connectionType === 'ad' && (
              <div className="space-y-2">
                <Label className="text-foreground">Domain</Label>
                <Input 
                  placeholder="COMPANY"
                  className="bg-muted border-border text-foreground"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="authentication" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Bind DN *</Label>
              <Input 
                placeholder="CN=admin,DC=company,DC=com"
                className="bg-muted border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">Tài khoản để xác thực với {connectionType === 'ad' ? 'AD' : 'LDAP'} server</p>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Mật khẩu *</Label>
              <Input 
                type="password"
                placeholder="••••••••"
                className="bg-muted border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">User Search Filter</Label>
              <Input 
                placeholder={connectionType === 'ad' ? '(&(objectClass=user)(sAMAccountName={username}))' : '(&(objectClass=inetOrgPerson)(uid={username}))'}
                className="bg-muted border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Group Search Filter</Label>
              <Input 
                placeholder={connectionType === 'ad' ? '(objectClass=group)' : '(objectClass=groupOfNames)'}
                className="bg-muted border-border text-foreground"
              />
            </div>
          </TabsContent>

          <TabsContent value="mapping" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Ánh xạ các thuộc tính từ {connectionType === 'ad' ? 'AD' : 'LDAP'} sang hệ thống
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Username Attribute</Label>
                <Input 
                  placeholder={connectionType === 'ad' ? 'sAMAccountName' : 'uid'}
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Email Attribute</Label>
                <Input 
                  placeholder="mail"
                  className="bg-muted border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">First Name Attribute</Label>
                <Input 
                  placeholder="givenName"
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Last Name Attribute</Label>
                <Input 
                  placeholder="sn"
                  className="bg-muted border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Display Name Attribute</Label>
                <Input 
                  placeholder="displayName"
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Member Attribute</Label>
                <Input 
                  placeholder={connectionType === 'ad' ? 'member' : 'memberOf'}
                  className="bg-muted border-border text-foreground"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Connection Status */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-primary mb-4">Trạng thái kết nối</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trạng thái:</span>
            <span className="text-yellow-500">Chưa kết nối</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lần kiểm tra cuối:</span>
            <span className="text-foreground">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Số người dùng đồng bộ:</span>
            <span className="text-foreground">-</span>
          </div>
        </div>
        <div className="mt-4">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2" onClick={handleSyncNow} disabled={isSyncing}>
            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Đồng bộ ngay
          </Button>
        </div>
      </Card>
    </div>
  );
}