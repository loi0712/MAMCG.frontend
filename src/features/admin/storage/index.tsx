import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Cloud, HardDrive, Loader2, Pencil, Play, RefreshCw, Settings2, Square, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdminListToolbar } from '../components/admin-list-toolbar'
import { AdminPagination } from '../components/admin-pagination'
import { AdminTableState } from '../components/admin-table-state'
import { ALL_ITEMS } from '../api/common'
import {
  formatBytes,
  type StoragePoint,
  type StorageUsage,
  useDeleteStoragePoint,
  useStoragePoints,
  useStorageUsages,
  useUpdateStoragePoint,
} from '../api/configuration'
import { StorageFormDialog } from './components/storage-form-dialog'
import { STORAGE_TYPES, isCloudType } from './components/storage-types'

const PAGE_SIZE = 10

type UsageState = { usage?: StorageUsage; isLoading: boolean; isError: boolean; isFetching: boolean }

const usagePercent = (usage: StorageUsage | undefined) =>
  usage?.available && usage.totalBytes ? Math.min(100, ((usage.usedBytes ?? 0) / usage.totalBytes) * 100) : null

const barColor = (percent: number) =>
  percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-yellow-500' : 'bg-primary'

const typeLabel = (type: string | null | undefined) =>
  STORAGE_TYPES.find((t) => t.value.toLowerCase() === (type ?? '').toLowerCase())?.value ?? type ?? '—'

function UsageCell({ state }: { state: UsageState | undefined }) {
  if (!state || state.isLoading) return <Skeleton className='h-4 w-32' />
  if (state.isError) return <span className='text-destructive text-sm'>Không đọc được dung lượng</span>
  const usage = state.usage
  const percent = usagePercent(usage)
  if (!usage?.available || percent == null)
    return (
      <span className='text-muted-foreground text-sm' title={usage?.message ?? undefined}>
        Không xác định
      </span>
    )
  return (
    <div className='min-w-40 space-y-1'>
      <div className='bg-primary/20 h-2 w-full overflow-hidden rounded-full'>
        <div className={cn('h-full transition-all', barColor(percent))} style={{ width: `${percent}%` }} />
      </div>
      <div className='text-muted-foreground flex justify-between gap-2 text-xs'>
        <span>
          {formatBytes(usage.usedBytes)} / {formatBytes(usage.totalBytes)}
        </span>
        <span>{percent.toFixed(0)}%</span>
      </div>
    </div>
  )
}

export function StorageView() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StoragePoint | null>(null)
  const [deleting, setDeleting] = useState<StoragePoint | null>(null)

  const { data, isLoading, isError } = useStoragePoints({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  // Toàn bộ điểm lưu trữ cho phần thống kê tổng
  const { data: all } = useStoragePoints(ALL_ITEMS)
  const storages = useMemo(() => data?.items ?? [], [data])
  const allStorages = useMemo(() => all?.items ?? [], [all])

  const ids = useMemo(() => {
    const set = new Set<number>()
    for (const s of [...allStorages, ...storages]) if (s.id != null) set.add(s.id)
    return [...set]
  }, [allStorages, storages])
  const usageQueries = useStorageUsages(ids)

  const usages = useMemo(() => {
    const map = new Map<number, UsageState>()
    ids.forEach((id, i) => {
      const q = usageQueries[i]
      if (q) map.set(id, { usage: q.data, isLoading: q.isLoading, isError: q.isError, isFetching: q.isFetching })
    })
    return map
  }, [ids, usageQueries])

  // Tổng dung lượng: nhiều điểm trên cùng một ổ đĩa trả cùng số liệu -> chỉ tính một lần
  const totals = useMemo(() => {
    const volumes = new Map<string, StorageUsage>()
    for (const s of allStorages) {
      const usage = s.id != null ? usages.get(s.id)?.usage : undefined
      if (usage?.available && usage.totalBytes != null)
        volumes.set(`${usage.totalBytes}:${usage.freeBytes ?? ''}`, usage)
    }
    let total = 0
    let used = 0
    volumes.forEach((u) => {
      total += u.totalBytes ?? 0
      used += u.usedBytes ?? 0
    })
    return { total, used, volumes: volumes.size }
  }, [allStorages, usages])

  const usageLoading = ids.some((id) => usages.get(id)?.isLoading)
  const activeCount = allStorages.filter((s) => s.isActive).length

  const deleteStorage = useDeleteStoragePoint()
  const updateStorage = useUpdateStoragePoint()

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openForm = (storage: StoragePoint | null) => {
    setEditing(storage)
    setFormOpen(true)
  }

  const refreshUsage = (id: number) => queryClient.invalidateQueries({ queryKey: ['admin-storage-usage', id] })

  // Secret trả về đã che: gửi lại nguyên chuỗi để backend giữ giá trị cũ
  const setActive = (storage: StoragePoint, isActive: boolean) => {
    if (storage.id == null) return
    updateStorage.mutate({
      id: storage.id,
      data: {
        name: storage.name ?? '',
        path: storage.path ?? '',
        type: storage.type ?? '',
        accessKey: storage.accessKey ?? null,
        secretKey: storage.secretKey ?? null,
        description: storage.description ?? null,
        isActive,
      },
    })
  }

  const confirmDelete = async () => {
    if (deleting?.id == null) return
    await deleteStorage.mutateAsync(deleting.id)
    setDeleting(null)
  }

  const getStatusBadge = (storage: StoragePoint, state: UsageState | undefined) => {
    if (!storage.isActive)
      return (
        <Badge variant='outline' className='border-border text-muted-foreground'>
          Đã tắt
        </Badge>
      )
    if (!state || state.isLoading)
      return (
        <Badge variant='outline' className='border-border text-muted-foreground'>
          Đang kiểm tra
        </Badge>
      )
    if (state.usage?.available)
      return (
        <Badge variant='outline' className='border-green-500 text-green-400'>
          Truy cập được
        </Badge>
      )
    return (
      <Badge
        variant='outline'
        className='border-red-500 text-red-400'
        title={state.usage?.message ?? 'Không đọc được dung lượng'}
      >
        Không truy cập được
      </Badge>
    )
  }

  const usedPercent = totals.total > 0 ? (totals.used / totals.total) * 100 : null

  return (
    <div className='space-y-4'>
      <AdminListToolbar
        placeholder='Tìm hệ thống lưu trữ...'
        onSearch={handleSearch}
        addLabel='Thêm hệ thống lưu trữ'
        onAdd={() => openForm(null)}
      />

      {/* Statistics */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Tổng số lưu trữ</div>
          <div className='text-foreground mt-2 text-2xl'>{all?.totalCount ?? '—'}</div>
        </div>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Đang hoạt động</div>
          <div className='mt-2 text-2xl text-green-400'>{all ? activeCount : '—'}</div>
        </div>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Tổng dung lượng</div>
          <div className='text-primary mt-2 flex items-center gap-2 text-2xl'>
            {usageLoading && totals.total === 0 ? <Loader2 className='h-5 w-5 animate-spin' /> : formatBytes(totals.total)}
          </div>
          <div className='text-muted-foreground mt-1 text-xs'>{totals.volumes} ổ đĩa đọc được</div>
        </div>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Đã sử dụng</div>
          <div className='mt-2 flex items-center gap-2 text-2xl text-yellow-400'>
            {usageLoading && totals.total === 0 ? <Loader2 className='h-5 w-5 animate-spin' /> : formatBytes(totals.used)}
          </div>
          {usedPercent != null && (
            <div className='text-muted-foreground mt-1 text-xs'>{usedPercent.toFixed(1)}% tổng dung lượng</div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='border-border overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-card border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-16'>STT</TableHead>
              <TableHead className='text-muted-foreground'>Tên hệ thống</TableHead>
              <TableHead className='text-muted-foreground'>Loại</TableHead>
              <TableHead className='text-muted-foreground'>Đường dẫn</TableHead>
              <TableHead className='text-muted-foreground'>Đã dùng / Dung lượng</TableHead>
              <TableHead className='text-muted-foreground'>Còn trống</TableHead>
              <TableHead className='text-muted-foreground'>Trạng thái</TableHead>
              <TableHead className='text-muted-foreground'>Kích hoạt</TableHead>
              <TableHead className='text-muted-foreground text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={9}
              isLoading={isLoading}
              isError={isError}
              isEmpty={storages.length === 0}
              emptyText='Chưa có hệ thống lưu trữ nào'
            />
            {storages.map((storage, index) => {
              const state = storage.id != null ? usages.get(storage.id) : undefined
              const usage = state?.usage
              return (
                <TableRow key={storage.id} className='border-border hover:bg-accent'>
                  <TableCell className='text-muted-foreground'>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                  <TableCell className='text-foreground'>
                    <div className='flex items-center gap-2'>
                      {isCloudType(storage.type) ? (
                        <Cloud className='h-4 w-4 shrink-0 text-blue-400' />
                      ) : (
                        <HardDrive className='text-primary h-4 w-4 shrink-0' />
                      )}
                      <div>
                        <div>{storage.name}</div>
                        {storage.description && (
                          <div className='text-muted-foreground text-xs'>{storage.description}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className='border-purple-500 text-purple-400'>
                      {typeLabel(storage.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground font-mono text-sm break-all'>{storage.path}</TableCell>
                  <TableCell>
                    <UsageCell state={state} />
                  </TableCell>
                  <TableCell className='text-foreground text-sm'>
                    {usage?.available ? formatBytes(usage.freeBytes) : '—'}
                  </TableCell>
                  <TableCell>{getStatusBadge(storage, state)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={!!storage.isActive}
                      disabled={updateStorage.isPending}
                      onCheckedChange={(checked) => setActive(storage, checked)}
                      aria-label='Kích hoạt'
                      className='data-[state=checked]:bg-primary'
                    />
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-end'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            aria-label='Thao tác'
                            className='text-primary hover:text-foreground hover:bg-accent h-8 w-8 p-0'
                          >
                            <Settings2 className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='bg-card border-border w-56'>
                          <DropdownMenuItem className='cursor-pointer' onClick={() => openForm(storage)}>
                            <Pencil className='mr-2 h-4 w-4' />
                            Chỉnh sửa cấu hình
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='cursor-pointer'
                            disabled={storage.id == null || state?.isFetching}
                            onClick={() => storage.id != null && refreshUsage(storage.id)}
                          >
                            <RefreshCw className={cn('mr-2 h-4 w-4', state?.isFetching && 'animate-spin')} />
                            Làm mới dung lượng
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className='bg-border' />
                          {storage.isActive ? (
                            <DropdownMenuItem
                              className='cursor-pointer text-yellow-400 hover:bg-yellow-900/20'
                              disabled={updateStorage.isPending}
                              onClick={() => setActive(storage, false)}
                            >
                              <Square className='mr-2 h-4 w-4' />
                              Tắt lưu trữ
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className='cursor-pointer text-green-400 hover:bg-green-900/20'
                              disabled={updateStorage.isPending}
                              onClick={() => setActive(storage, true)}
                            >
                              <Play className='mr-2 h-4 w-4' />
                              Kích hoạt
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className='bg-border' />
                          <DropdownMenuItem
                            className='cursor-pointer text-red-400 hover:bg-red-900/20'
                            onClick={() => setDeleting(storage)}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Xóa storage
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      <p className='text-muted-foreground text-xs'>
        Dung lượng được đọc từ ổ đĩa chứa đường dẫn trên máy chủ API; bucket cloud hoặc đường dẫn chưa mount sẽ không
        xác định được.
      </p>

      <StorageFormDialog open={formOpen} onOpenChange={setFormOpen} storage={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xóa hệ thống lưu trữ'
        desc={`Xóa hệ thống lưu trữ "${deleting?.name ?? ''}"?`}
        cancelBtnText='Huỷ'
        confirmText='Xóa'
        destructive
        isLoading={deleteStorage.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
