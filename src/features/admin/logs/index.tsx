import { useState } from 'react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { Monitor, RefreshCw, Server, UserRound, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ActivityLogsTab } from './components/activity-logs-tab'
import { CGServerLogsTab } from './components/cg-server-logs-tab'
import { LdapSyncLogsTab } from './components/ldap-sync-logs-tab'
import { SystemLogsTab } from './components/system-logs-tab'

type LogTab = 'activities' | 'system' | 'cg-servers' | 'ldap-sync'

export function LogsView() {
  const [activeTab, setActiveTab] = useState<LogTab>('activities')
  const queryClient = useQueryClient()
  const isFetching = useIsFetching({ queryKey: ['admin-logs'] }) > 0

  // Nhật ký chỉ đọc: backend không có API xoá, chỉ tải lại dữ liệu mới nhất
  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['admin-logs'] })

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LogTab)} className='space-y-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <TabsList className='bg-muted border-border border'>
          <TabsTrigger value='activities'>
            <UserRound className='mr-2 h-4 w-4' />
            Hoạt động người dùng
          </TabsTrigger>
          <TabsTrigger value='system'>
            <Monitor className='mr-2 h-4 w-4' />
            Hệ thống
          </TabsTrigger>
          <TabsTrigger value='cg-servers'>
            <Server className='mr-2 h-4 w-4' />
            CG Server
          </TabsTrigger>
          <TabsTrigger value='ldap-sync'>
            <Users className='mr-2 h-4 w-4' />
            Đồng bộ LDAP
          </TabsTrigger>
        </TabsList>

        <Button
          onClick={handleRefresh}
          disabled={isFetching}
          variant='outline'
          className='border-border text-foreground hover:bg-accent flex items-center gap-2'
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Đang làm mới...' : 'Làm mới'}
        </Button>
      </div>

      {/* forceMount giữ bộ lọc/trang khi chuyển tab; chỉ tab đang mở mới gọi API */}
      <TabsContent value='activities' forceMount hidden={activeTab !== 'activities'}>
        <ActivityLogsTab active={activeTab === 'activities'} />
      </TabsContent>
      <TabsContent value='system' forceMount hidden={activeTab !== 'system'}>
        <SystemLogsTab active={activeTab === 'system'} />
      </TabsContent>
      <TabsContent value='cg-servers' forceMount hidden={activeTab !== 'cg-servers'}>
        <CGServerLogsTab active={activeTab === 'cg-servers'} />
      </TabsContent>
      <TabsContent value='ldap-sync' forceMount hidden={activeTab !== 'ldap-sync'}>
        <LdapSyncLogsTab active={activeTab === 'ldap-sync'} />
      </TabsContent>
    </Tabs>
  )
}
