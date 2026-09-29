import { useCallback, useState } from 'react'
import { Database, Loader2, Pencil, Play, Settings2, Square, TestTube, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdminListToolbar } from '../components/admin-list-toolbar'
import { AdminPagination } from '../components/admin-pagination'
import { AdminTableState } from '../components/admin-table-state'
import { ALL_ITEMS } from '../api/common'
import {
  type ConnectionTestResult,
  type DatabaseConnection,
  useDatabases,
  useDeleteDatabase,
  useTestDatabase,
  useUpdateDatabase,
} from '../api/configuration'
import { DatabaseFormDialog } from './components/database-form-dialog'
import { DATABASE_TYPES } from './components/database-types'

const PAGE_SIZE = 10

type TestState = ConnectionTestResult & { testedAt: Date }

// Lấy giá trị theo khoá trong connection string (vd. Server=...;Database=...)
const readConnectionPart = (cs: string | null | undefined, keys: string[]) => {
  for (const part of (cs ?? '').split(';')) {
    const index = part.indexOf('=')
    if (index < 0) continue
    const key = part.slice(0, index).trim().toLowerCase()
    if (keys.includes(key)) return part.slice(index + 1).trim()
  }
  return null
}

// Dạng URI (mongodb://user:pass@host:port/db)
const parseUri = (cs: string) => {
  try {
    const url = new URL(cs)
    return { host: url.host || null, database: url.pathname.replace(/^\//, '') || null }
  } catch {
    return null
  }
}

const describeConnection = (cs: string | null | undefined) => {
  const uri = cs?.includes('://') ? parseUri(cs) : null
  if (uri) return uri
  const host = readConnectionPart(cs, ['server', 'data source', 'host', 'address', 'addr'])
  const port = readConnectionPart(cs, ['port'])
  return {
    host: host && port ? `${host}:${port}` : host,
    database: readConnectionPart(cs, ['database', 'initial catalog']),
  }
}

const typeLabel = (type: string | null | undefined) =>
  DATABASE_TYPES.find((t) => t.value.toLowerCase() === (type ?? '').toLowerCase())?.label ?? type ?? '—'

const formatDateTime = (value: Date | string | null | undefined) =>
  value ? new Date(value).toLocaleString('vi-VN') : '—'

export function DatabaseView() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DatabaseConnection | null>(null)
  const [deleting, setDeleting] = useState<DatabaseConnection | null>(null)
  const [testingId, setTestingId] = useState<number | null>(null)
  // Kết quả kiểm tra trong phiên làm việc (backend không lưu trạng thái kết nối)
  const [testResults, setTestResults] = useState<Record<number, TestState>>({})

  const { data, isLoading, isError } = useDatabases({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const { data: all } = useDatabases(ALL_ITEMS)
  const databases = data?.items ?? []
  const allDatabases = all?.items ?? []

  const deleteDatabase = useDeleteDatabase()
  const updateDatabase = useUpdateDatabase()
  const testDatabase = useTestDatabase()

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openForm = (db: DatabaseConnection | null) => {
    setEditing(db)
    setFormOpen(true)
  }

  const runTest = async (id: number) => {
    setTestingId(id)
    try {
      const result = await testDatabase.mutateAsync(id)
      setTestResults((prev) => ({ ...prev, [id]: { ...result, testedAt: new Date() } }))
    } finally {
      setTestingId(null)
    }
  }

  // Chuỗi kết nối trả về đã che mật khẩu: gửi lại nguyên chuỗi để backend giữ mật khẩu cũ
  const toggleActive = (db: DatabaseConnection) => {
    if (db.id == null) return
    updateDatabase.mutate({
      id: db.id,
      data: {
        name: db.name ?? '',
        type: db.type ?? '',
        connectionString: db.connectionString ?? '',
        description: db.description ?? null,
        isActive: !db.isActive,
      },
    })
  }

  const confirmDelete = async () => {
    if (deleting?.id == null) return
    await deleteDatabase.mutateAsync(deleting.id)
    setDeleting(null)
  }

  const activeCount = allDatabases.filter((d) => d.isActive).length
  const failedCount = Object.values(testResults).filter((r) => !r.success).length

  const getStatusBadge = (db: DatabaseConnection) => {
    if (!db.isActive)
      return (
        <Badge variant='outline' className='border-border text-muted-foreground'>
          Đã tắt
        </Badge>
      )
    const result = db.id != null ? testResults[db.id] : undefined
    if (!result)
      return (
        <Badge variant='outline' className='border-blue-500 text-blue-400'>
          Chưa kiểm tra
        </Badge>
      )
    return (
      <Badge
        variant='outline'
        title={result.message ?? undefined}
        className={result.success ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}
      >
        {result.success ? 'Đã kết nối' : 'Lỗi'}
      </Badge>
    )
  }

  return (
    <div className='space-y-4'>
      <AdminListToolbar
        placeholder='Tìm kết nối database...'
        onSearch={handleSearch}
        addLabel='Thêm kết nối'
        onAdd={() => openForm(null)}
      />

      {/* Statistics */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Tổng số kết nối</div>
          <div className='text-foreground mt-2 text-2xl'>{all?.totalCount ?? '—'}</div>
        </div>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Đang kích hoạt</div>
          <div className='mt-2 text-2xl text-green-400'>{all ? activeCount : '—'}</div>
        </div>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Đã tắt</div>
          <div className='text-muted-foreground mt-2 text-2xl'>{all ? allDatabases.length - activeCount : '—'}</div>
        </div>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Kiểm tra lỗi (phiên này)</div>
          <div className='mt-2 text-2xl text-red-400'>{failedCount}</div>
        </div>
      </div>

      {/* Table */}
      <div className='border-border overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-card border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-16'>STT</TableHead>
              <TableHead className='text-muted-foreground'>Tên kết nối</TableHead>
              <TableHead className='text-muted-foreground'>Loại DB</TableHead>
              <TableHead className='text-muted-foreground'>Host</TableHead>
              <TableHead className='text-muted-foreground'>Database</TableHead>
              <TableHead className='text-muted-foreground'>Trạng thái</TableHead>
              <TableHead className='text-muted-foreground'>Kiểm tra gần nhất</TableHead>
              <TableHead className='text-muted-foreground'>Cập nhật</TableHead>
              <TableHead className='text-muted-foreground text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={9}
              isLoading={isLoading}
              isError={isError}
              isEmpty={databases.length === 0}
              emptyText='Chưa có kết nối database nào'
            />
            {databases.map((db, index) => {
              const { host, database } = describeConnection(db.connectionString)
              const result = db.id != null ? testResults[db.id] : undefined
              const testing = testingId != null && testingId === db.id
              return (
                <TableRow key={db.id} className='border-border hover:bg-accent'>
                  <TableCell className='text-muted-foreground'>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                  <TableCell className='text-foreground'>
                    <div className='flex items-center gap-2'>
                      <Database className='text-primary h-4 w-4 shrink-0' />
                      <div>
                        <div>{db.name}</div>
                        {db.description && <div className='text-muted-foreground text-xs'>{db.description}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className='border-blue-500 text-blue-400'>
                      {typeLabel(db.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-foreground font-mono text-sm'>{host ?? '—'}</TableCell>
                  <TableCell className='text-foreground font-mono text-sm'>{database ?? '—'}</TableCell>
                  <TableCell>{getStatusBadge(db)}</TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {result ? (
                      <span title={result.message ?? undefined}>
                        {formatDateTime(result.testedAt)}
                        {result.success && ` · ${result.elapsedMs ?? 0} ms`}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>{formatDateTime(db.modifiedAt)}</TableCell>
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
                            {testing ? <Loader2 className='h-4 w-4 animate-spin' /> : <Settings2 className='h-4 w-4' />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='bg-card border-border w-52'>
                          <DropdownMenuItem className='cursor-pointer' onClick={() => openForm(db)}>
                            <Pencil className='mr-2 h-4 w-4' />
                            Chỉnh sửa cấu hình
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='cursor-pointer'
                            disabled={testing || db.id == null}
                            onClick={() => db.id != null && runTest(db.id)}
                          >
                            <TestTube className='mr-2 h-4 w-4' />
                            Kiểm tra kết nối
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className='bg-border' />
                          {db.isActive ? (
                            <DropdownMenuItem
                              className='cursor-pointer text-yellow-400 hover:bg-yellow-900/20'
                              disabled={updateDatabase.isPending}
                              onClick={() => toggleActive(db)}
                            >
                              <Square className='mr-2 h-4 w-4' />
                              Tắt kết nối
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className='cursor-pointer text-green-400 hover:bg-green-900/20'
                              disabled={updateDatabase.isPending}
                              onClick={() => toggleActive(db)}
                            >
                              <Play className='mr-2 h-4 w-4' />
                              Kích hoạt
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className='bg-border' />
                          <DropdownMenuItem
                            className='cursor-pointer text-red-400 hover:bg-red-900/20'
                            onClick={() => setDeleting(db)}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Xóa kết nối
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
        Kiểm tra kết nối dùng cấu hình đã lưu và hiện chỉ hỗ trợ MS SQL Server.
      </p>

      <DatabaseFormDialog open={formOpen} onOpenChange={setFormOpen} database={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xóa kết nối database'
        desc={`Xóa kết nối "${deleting?.name ?? ''}"?`}
        cancelBtnText='Huỷ'
        confirmText='Xóa'
        destructive
        isLoading={deleteDatabase.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
