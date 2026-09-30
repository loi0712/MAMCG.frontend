import { useEffect, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { AlertTriangle, ClipboardList, ExternalLink, History, Loader2, RefreshCw, Search } from 'lucide-react'
import { Main } from '@/components/layout/Main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '@/features/admin/components/admin-pagination'
import { cn } from '@/shared/lib/utils'
import { getServerErrorMessage } from '@/utils/handle-server-error'
import { type MyTask, referenceLink, useMyTaskSummary, useMyTasks } from './api/tasks'
import { WorkflowHistoryDialog } from './components/workflow-history-dialog'
import { formatDateTime, statusLabel } from './utils'

const route = getRouteApi('/_authenticated/tasks')
const PAGE_SIZE = 20

type DeadlineFilter = 'all' | 'overdue' | 'on-time'

const REFERENCE_LABELS: Record<string, string> = {
  asset: 'Tài sản',
  'cg-scene': 'Cảnh CG',
}

export function TasksPage() {
  const search = route.useSearch()
  const navigate = useNavigate()
  const page = search.page ?? 1
  const [term, setTerm] = useState(search.search ?? '')
  const [historyTask, setHistoryTask] = useState<MyTask | null>(null)

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ to: '/tasks', search: { ...search, page: undefined, ...patch }, replace: true })

  // Gõ tìm kiếm: chờ 300ms rồi mới cập nhật URL
  useEffect(() => {
    const value = term.trim() || undefined
    if (value === search.search) return
    const timer = setTimeout(() => setSearch({ search: value }), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  // Bấm menu khác (đổi URL) thì ô tìm kiếm theo URL
  useEffect(() => setTerm(search.search ?? ''), [search.search])

  const { data, isLoading, isError, error, isFetching, refetch } = useMyTasks({
    statusId: search.statusId,
    overdue: search.overdue,
    search: search.search,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  })
  const { data: summary } = useMyTaskSummary()
  const tasks = data?.items ?? []
  const totalCount = data?.totalCount ?? 0

  const deadline: DeadlineFilter = search.overdue === true ? 'overdue' : search.overdue === false ? 'on-time' : 'all'
  const statuses = summary?.statuses ?? []
  const duplicateNames = new Set(
    statuses.map((s) => s.statusName).filter((name, i, all) => all.indexOf(name) !== i)
  )

  // Trang hiện tại vượt quá tổng (vd. vừa xử lý xong việc cuối trang): lùi về trang cuối
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    if (data && page > totalPages) navigate({ to: '/tasks', search: { ...search, page: totalPages > 1 ? totalPages : undefined }, replace: true })
  }, [data, totalCount, page, navigate, search])

  // Có trang chi tiết (tài sản) thì mở trang; chưa có trang riêng (cảnh CG, nội dung cũ) thì xem lịch sử
  const open = (task: MyTask) => {
    const link = referenceLink(task)
    if (link) navigate(link)
    else setHistoryTask(task)
  }

  return (
    <Main className='flex flex-col gap-4 overflow-auto'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <ClipboardList className='text-primary h-6 w-6' />
          <div>
            <h3 className='text-primary font-semibold'>Công việc của tôi</h3>
            <p className='text-muted-foreground text-sm'>
              {summary ? `${summary.total} việc đang chờ xử lý` : 'Nội dung đang chờ bạn hoặc nhóm của bạn xử lý'}
              {summary && summary.overdue > 0 && <span className='text-destructive'> · {summary.overdue} quá hạn</span>}
            </p>
          </div>
        </div>
        <Button variant='outline' size='sm' onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          Làm mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative min-w-56 flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Tìm theo mã, nội dung...'
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select
          value={search.statusId ? String(search.statusId) : 'all'}
          onValueChange={(v) => setSearch({ statusId: v === 'all' ? undefined : Number(v) })}
        >
          <SelectTrigger className='w-56' aria-label='Lọc theo trạng thái'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả trạng thái</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.statusId} value={String(s.statusId)}>
                {statusLabel(s, duplicateNames)} ({s.count})
              </SelectItem>
            ))}
            {/* Trạng thái đang lọc nhưng không còn việc nào */}
            {search.statusId && !statuses.some((s) => s.statusId === search.statusId) && (
              <SelectItem value={String(search.statusId)}>Trạng thái #{search.statusId} (0)</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Select
          value={deadline}
          onValueChange={(v) => setSearch({ overdue: v === 'overdue' ? true : v === 'on-time' ? false : undefined })}
        >
          <SelectTrigger className='w-40' aria-label='Lọc theo hạn xử lý'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Mọi hạn xử lý</SelectItem>
            <SelectItem value='overdue'>Quá hạn</SelectItem>
            <SelectItem value='on-time'>Còn hạn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nội dung</TableHead>
              <TableHead>Quy trình</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Được giao lúc</TableHead>
              <TableHead>Hạn xử lý</TableHead>
              <TableHead className='w-32 text-right'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }, (__, j) => (
                    <TableCell key={j}>
                      <Skeleton className='h-4 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && isError && (
              <TableRow>
                <TableCell colSpan={6} className='text-destructive py-8 text-center text-sm'>
                  {getServerErrorMessage(error, 'Không tải được danh sách công việc.')}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className='text-muted-foreground py-8 text-center text-sm'>
                  {search.statusId || search.overdue !== undefined || search.search
                    ? 'Không có công việc phù hợp bộ lọc'
                    : 'Bạn không có công việc nào đang chờ xử lý'}
                </TableCell>
              </TableRow>
            )}

            {tasks.map((task) => {
              const link = referenceLink(task)
              return (
                <TableRow
                  key={task.id}
                  className={cn('cursor-pointer', task.isOverdue && 'bg-red-500/5')}
                  onClick={() => open(task)}
                >
                  <TableCell>
                    <div className='font-medium'>{task.title}</div>
                    <div className='text-muted-foreground text-xs'>
                      {task.referenceType ? REFERENCE_LABELS[task.referenceType] ?? task.referenceType : 'Nội dung'}
                      {task.content && task.content !== task.title && ` · ${task.content}`}
                    </div>
                  </TableCell>
                  <TableCell className='text-sm'>{task.workflowName}</TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      style={task.statusColor ? { borderColor: task.statusColor, color: task.statusColor } : undefined}
                    >
                      {task.statusName}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>{formatDateTime(task.assignedAt) || '—'}</TableCell>
                  <TableCell className='text-sm'>
                    {task.deadline ? (
                      <span className={cn('inline-flex items-center gap-1', task.isOverdue && 'text-destructive font-medium')}>
                        {task.isOverdue && <AlertTriangle className='h-3.5 w-3.5' />}
                        {formatDateTime(task.deadline)}
                      </span>
                    ) : (
                      <span className='text-muted-foreground'>Không giới hạn</span>
                    )}
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      aria-label='Lịch sử & phiên bản'
                      title='Lịch sử & phiên bản'
                      onClick={(e) => {
                        e.stopPropagation()
                        setHistoryTask(task)
                      }}
                    >
                      <History className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      disabled={!link}
                      title={link ? 'Mở trang chi tiết' : 'Chưa có trang chi tiết cho nội dung này'}
                      onClick={(e) => {
                        e.stopPropagation()
                        open(task)
                      }}
                    >
                      <ExternalLink className='h-4 w-4' />
                      Mở
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center gap-2'>
        {isFetching && !isLoading && <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />}
        <div className='flex-1'>
          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={(p) => navigate({ to: '/tasks', search: { ...search, page: p > 1 ? p : undefined } })}
          />
        </div>
      </div>

      <WorkflowHistoryDialog
        itemId={historyTask?.id}
        title={historyTask?.title}
        open={!!historyTask}
        onOpenChange={(o) => !o && setHistoryTask(null)}
      />
    </Main>
  )
}
