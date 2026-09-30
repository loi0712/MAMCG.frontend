import { useState } from 'react'
import { z } from 'zod'
import { CheckCircle2, Loader2, Send, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type EmailSendResult, type EmailTemplate, useSendTestEmailTemplate } from '../../api/email-templates'

type EmailTemplateTestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplate | null
}

// Gửi thử mẫu (đã lưu) tới một địa chỉ, dùng biến mẫu của sự kiện
export function EmailTemplateTestDialog({ open, onOpenChange, template }: EmailTemplateTestDialogProps) {
  const [to, setTo] = useState('')
  const [result, setResult] = useState<EmailSendResult | null>(null)
  const sendTest = useSendTestEmailTemplate()

  // Đóng hộp thoại thì xoá kết quả lần gửi trước
  const handleOpenChange = (value: boolean) => {
    if (!value) setResult(null)
    onOpenChange(value)
  }

  const valid = z.email().safeParse(to.trim()).success

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!template?.id || !valid) return
    sendTest.mutate({ id: template.id, data: { to: to.trim() } }, { onSuccess: setResult })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='bg-card border-border text-foreground'>
        <DialogHeader>
          <DialogTitle className='text-primary'>Gửi thử mẫu email</DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            Gửi mẫu “{template?.name}” (nội dung đã lưu) với dữ liệu mẫu qua cấu hình SMTP hiện tại.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className='space-y-4' noValidate>
          <div className='space-y-2'>
            <Label htmlFor='email-template-test-to' className='text-foreground'>
              Email nhận *
            </Label>
            <Input
              id='email-template-test-to'
              type='email'
              autoFocus
              placeholder='you@mamcg.vn'
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className='bg-muted border-border text-foreground'
            />
            {to.trim() !== '' && !valid && <p className='text-destructive text-sm'>Email không hợp lệ</p>}
          </div>

          {result && (
            <div
              className={`flex items-start gap-2 rounded border p-3 text-sm ${
                result.success ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' />
              ) : (
                <XCircle className='mt-0.5 h-4 w-4 shrink-0' />
              )}
              <span className='break-words'>
                {result.message ?? (result.success ? 'Đã gửi' : 'Gửi thất bại')}
                {result.elapsedMs != null && ` (${result.elapsedMs} ms)`}
              </span>
            </div>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              className='border-border text-muted-foreground hover:bg-accent'
              onClick={() => handleOpenChange(false)}
            >
              Đóng
            </Button>
            <Button
              type='submit'
              className='bg-primary hover:bg-primary/90 text-primary-foreground'
              disabled={!valid || sendTest.isPending}
            >
              {sendTest.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
              Gửi thử
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
