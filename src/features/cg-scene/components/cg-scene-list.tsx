import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Eye, Plus, TvMinimalPlay } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/Main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '@/features/admin/components/admin-pagination'
import { AdminTableState } from '@/features/admin/components/admin-table-state'
import { type CGSceneListItem, useCGScenes } from '../api/cg-scenes'

const PAGE_SIZE = 20

const fieldOf = (scene: CGSceneListItem, name: string) => scene.fields.find((f) => f.fieldName === name)

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('vi-VN')
}

// Danh sách CG scene (của các thiết kế đã qua duyệt trung tâm)
export function CGSceneListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useCGScenes({ pageNumber: page, pageSize: PAGE_SIZE })
  const scenes = data?.cgScenes ?? []

  const open = (id: number) => navigate({ to: '/cg-scenes/details', search: { id: String(id) } })

  return (
    <Main>
      <div className='space-y-4 py-2'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <TvMinimalPlay className='text-muted-foreground h-5 w-5' />
            <h1 className='text-lg font-semibold'>CG scene</h1>
            <span className='text-muted-foreground text-sm'>({data?.totalCount ?? 0})</span>
          </div>
          <Button onClick={() => navigate({ to: '/cg-scenes/create' })}>
            <Plus className='h-4 w-4' /> Tạo CG scene
          </Button>
        </div>

        <div className='overflow-hidden rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow className='bg-card hover:bg-card'>
                <TableHead className='text-muted-foreground'>Mã scene</TableHead>
                <TableHead className='text-muted-foreground'>Tiêu đề</TableHead>
                <TableHead className='text-muted-foreground w-44'>Trạng thái</TableHead>
                <TableHead className='text-muted-foreground w-48'>Người xử lý</TableHead>
                <TableHead className='text-muted-foreground w-44'>Ngày tạo</TableHead>
                <TableHead className='text-muted-foreground w-20 text-center'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AdminTableState
                colSpan={6}
                isLoading={isLoading}
                isError={isError}
                isEmpty={scenes.length === 0}
                emptyText='Chưa có CG scene nào'
              />
              {scenes.map((scene) => {
                const status = fieldOf(scene, 'Status')
                return (
                  <TableRow key={scene.id} className='hover:bg-accent cursor-pointer' onClick={() => open(scene.id)}>
                    <TableCell className='font-mono text-sm'>{scene.code || `#${scene.id}`}</TableCell>
                    <TableCell>{fieldOf(scene, 'Title')?.value || fieldOf(scene, 'ProjectName')?.value || '—'}</TableCell>
                    <TableCell>
                      {status?.value ? (
                        <Badge variant='outline' style={status.color ? { borderColor: status.color, color: status.color } : undefined}>
                          {status.value}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm'>{fieldOf(scene, 'AssignedTo')?.value || '—'}</TableCell>
                    <TableCell className='text-muted-foreground text-sm'>{formatDate(scene.createdAt)}</TableCell>
                    <TableCell className='text-center'>
                      <Button variant='ghost' size='sm' aria-label='Xem chi tiết' onClick={() => open(scene.id)}>
                        <Eye className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />
      </div>
    </Main>
  )
}
