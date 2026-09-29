import { useState } from 'react'
import { AlertCircle, CheckCircle, RefreshCw, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type ConnectionTestResult, type LdapConfiguration, useTestLdapConfiguration } from '../../api/settings'

type LdapTestDialogProps = {
  config: LdapConfiguration | null
  onOpenChange: (open: boolean) => void
}

// Thử bind tài khoản dịch vụ; nhập thêm tài khoản người dùng để thử xác thực.
// Nơi dùng đặt key theo id cấu hình để làm mới trạng thái khi đổi cấu hình.
export function LdapTestDialog({ config, onOpenChange }: LdapTestDialogProps) {
  const testLdap = useTestLdapConfiguration()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<ConnectionTestResult | null>(null)

  const handleTest = async () => {
    if (!config?.id) return
    setResult(null)
    try {
      const user = username.trim()
      setResult(
        await testLdap.mutateAsync({ id: config.id, data: user ? { username: user, password } : undefined })
      )
    } catch {
      // Lỗi HTTP đã được hiển thị bởi bộ xử lý lỗi chung
    }
  }

  return (
    <Dialog open={!!config} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-primary'>Kiểm tra kết nối</DialogTitle>
          <DialogDescription className='font-mono text-xs break-all'>{config?.serverUrl}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Để trống tài khoản để chỉ thử kết nối và bind tài khoản dịch vụ. Nhập tài khoản người dùng để thử đăng
            nhập bằng cấu hình này.
          </p>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='ldap-test-username' className='text-foreground'>
                Tên đăng nhập
              </Label>
              <Input
                id='ldap-test-username'
                autoComplete='off'
                placeholder='nguyenvana'
                className='bg-muted border-border text-foreground'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='ldap-test-password' className='text-foreground'>
                Mật khẩu
              </Label>
              <Input
                id='ldap-test-password'
                type='password'
                autoComplete='new-password'
                className='bg-muted border-border text-foreground'
                value={password}
                disabled={!username.trim()}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {result?.success && (
            <div className='bg-green-900/20 border border-green-500 rounded p-3 text-sm text-green-600 flex gap-2'>
              <CheckCircle className='w-4 h-4 mt-0.5 shrink-0' />
              <span className='break-all'>
                {result.message} ({result.elapsedMs ?? 0} ms)
              </span>
            </div>
          )}
          {result && !result.success && (
            <div className='bg-red-900/20 border border-red-500 rounded p-3 text-sm text-destructive flex gap-2'>
              <AlertCircle className='w-4 h-4 mt-0.5 shrink-0' />
              <span className='break-all'>{result.message ?? 'Kết nối thất bại'}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            className='border-border text-foreground hover:bg-accent'
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          <Button
            type='button'
            className='bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2'
            onClick={handleTest}
            disabled={testLdap.isPending}
          >
            {testLdap.isPending ? <RefreshCw className='w-4 h-4 animate-spin' /> : <TestTube className='w-4 h-4' />}
            Kiểm tra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
