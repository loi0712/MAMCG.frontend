import { Loader2, Mail, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EMAIL_PREFIX, useSettings } from '../../api/settings'
import { EmailNotificationSettings } from './email-notification-settings'
import { SmtpSettingsForm } from './smtp-settings-form'

export function EmailSettings() {
  // Một lần gọi GET /api/Setting?prefix=email. cho cả SMTP và quy tắc thông báo
  const { data, isLoading, isError, refetch } = useSettings(EMAIL_PREFIX)

  if (isLoading) {
    return (
      <Card className='bg-card border-border text-muted-foreground flex flex-row items-center justify-center gap-2 p-12'>
        <Loader2 className='h-4 w-4 animate-spin' /> Đang tải cấu hình email...
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card className='bg-card border-border flex flex-col items-center gap-3 p-12'>
        <span className='text-destructive'>Không tải được cấu hình email. Vui lòng thử lại.</span>
        <Button variant='outline' onClick={() => refetch()}>
          Thử lại
        </Button>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      <Tabs defaultValue='smtp' className='w-full'>
        <TabsList className='bg-card border border-border'>
          <TabsTrigger
            value='smtp'
            className='data-[state=active]:bg-muted data-[state=active]:text-primary text-muted-foreground'
          >
            <Server className='w-4 h-4 mr-2' />
            Cấu hình SMTP
          </TabsTrigger>
          <TabsTrigger
            value='notifications'
            className='data-[state=active]:bg-muted data-[state=active]:text-primary text-muted-foreground'
          >
            <Mail className='w-4 h-4 mr-2' />
            Thông báo
          </TabsTrigger>
        </TabsList>

        <TabsContent value='smtp' className='space-y-6 mt-6'>
          <SmtpSettingsForm settings={data} />
        </TabsContent>

        <TabsContent value='notifications' className='space-y-6 mt-6'>
          <EmailNotificationSettings settings={data} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
