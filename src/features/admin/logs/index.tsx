import { useState } from 'react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { History, Monitor, RefreshCw, Server, Trash2, UserRound, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { LogKind } from '../api/logs'
import { ActivityLogsTab } from './components/activity-logs-tab'
import { AuditLogsTab } from './components/audit-logs-tab'
import { CGServerLogsTab } from './components/cg-server-logs-tab'
import { LdapSyncLogsTab } from './components/ldap-sync-logs-tab'
import { PurgeLogsDialog } from './components/purge-logs-dialog'
import { SystemLogsTab } from './components/system-logs-tab'

type LogTab = 'activities' | 'audit' | 'system' | 'cg-servers' | 'ldap-sync'

// Tab → loại nhật ký của API xoá /api/Log/{kind}
const TAB_KIND: Record<LogTab, LogKind> = {
  activities: 'activities',
  audit: 'audit',
  system: 'system',
  'cg-servers': 'cg-server',
  'ldap-sync': 'ldap-sync',
}

export function LogsView() {
  const [activeTab, setActiveTab] = useState<LogTab>('activities')
  const queryClient = useQueryClient()
  const isFetching = useIsFetching({ queryKey: ['admin-logs'] }) > 0
  const [purgeOpen, setPurgeOpen] = useState(false)

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['admin-logs'] })

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LogTab)} className='space-y-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <TabsList className='bg-muted border-border border'>
          <TabsTrigger value='activities'>
            <UserRound className='mr-2 h-4 w-4' />
            Hoạt động người dùng
          </TabsTrigger>
          <TabsTrigger value='audit'>
            <History className='mr-2 h-4 w-4' />
            Kiểm toán
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

        <div className='flex items-center gap-2'>
          <Button
            onClick={handleRefresh}
            disabled={isFetching}
            variant='outline'
            className='border-border text-foreground hover:bg-accent flex items-center gap-2'
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Đang làm mới...' : 'Làm mới'}
          </Button>
          <Button
            onClick={() => setPurgeOpen(true)}
            variant='outline'
            className='flex items-center gap-2 border-red-500 text-red-400 hover:bg-red-900/20'
          >
            <Trash2 className='h-4 w-4' />
            Xoá nhật ký
          </Button>
        </div>
      </div>

      {/* key: mở lại theo tab hiện tại với lựa chọn mặc định */}
      <PurgeLogsDialog key={activeTab} kind={TAB_KIND[activeTab]} open={purgeOpen} onOpenChange={setPurgeOpen} />

      {/* forceMount giữ bộ lọc/trang khi chuyển tab; chỉ tab đang mở mới gọi API */}
      <TabsContent value='activities' forceMount hidden={activeTab !== 'activities'}>
        <ActivityLogsTab active={activeTab === 'activities'} />
      </TabsContent>
      <TabsContent value='audit' forceMount hidden={activeTab !== 'audit'}>
        <AuditLogsTab active={activeTab === 'audit'} />
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
