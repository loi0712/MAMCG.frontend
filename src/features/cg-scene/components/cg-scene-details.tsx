import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ImageOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/Main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { mediaUrl } from '@/utils/media-url'
import { type CGSceneContent, useApproveCGScene, useCGScene } from '../api/cg-scenes'

function ScenePreview({ scene }: { scene: CGSceneContent }) {
  const [failed, setFailed] = useState(false)
  if (!scene.previewPath || failed) {
    return (
      <div className='text-muted-foreground flex aspect-video w-full items-center justify-center rounded-lg bg-black/80'>
        <div className='flex flex-col items-center gap-2 text-sm'>
          <ImageOff className='h-8 w-8' /> Chưa có ảnh xem trước
        </div>
      </div>
    )
  }
  return (
    <img
      src={mediaUrl(scene.previewPath)}
      alt={scene.sceneName}
      className='aspect-video w-full rounded-lg bg-black object-contain'
      onError={() => setFailed(true)}
    />
  )
}

// Chi tiết CG scene + thực hiện hành động quy trình (duyệt/trả lại...) giống trang chi tiết thiết kế
export function CGSceneDetailPage({ id }: { id: number }) {
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useCGScene(id)
  const approve = useApproveCGScene()
  const [sceneIndex, setSceneIndex] = useState(0)
  const [comment, setComment] = useState('')

  if (isLoading) {
    return (
      <Main>
        <div className='text-muted-foreground flex h-60 items-center justify-center gap-2 text-sm'>
          <Loader2 className='h-5 w-5 animate-spin' /> Đang tải CG scene...
        </div>
      </Main>
    )
  }

  if (isError || !data) {
    return (
      <Main>
        <div className='flex h-60 flex-col items-center justify-center gap-3 text-sm'>
          <p className='text-destructive'>{error instanceof Error ? error.message : 'Không tìm thấy CG scene'}</p>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => refetch()}>Thử lại</Button>
            <Button variant='outline' size='sm' onClick={() => navigate({ to: '/cg-scenes' })}>Quay lại</Button>
          </div>
        </div>
      </Main>
    )
  }

  const scene = data.scenes[sceneIndex] ?? data.scenes[0]
  const actions = data.workflowItem?.actions ?? []
  const histories = data.workflowItem?.histories ?? []

  const runAction = async (actionId: string) => {
    try {
      await approve.mutateAsync({ id: data.id, actionId: Number(actionId), comment: comment.trim() || undefined })
      setComment('')
    } catch {
      // Lỗi (vd. không phải người được giao) đã được thông báo
    }
  }

  return (
    <Main>
      <div className='space-y-4 py-2'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' aria-label='Quay lại' onClick={() => navigate({ to: '/cg-scenes' })}>
            <ChevronLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-lg font-semibold'>
            CG scene <span className='font-mono'>{data.code}</span>
          </h1>
        </div>

        <div className='grid gap-6 lg:grid-cols-[1fr_380px]'>
          <div className='space-y-4'>
            {scene ? (
              <>
                <ScenePreview key={`${sceneIndex}-${scene.previewPath}`} scene={scene} />
                {data.scenes.length > 1 && (
                  <div className='flex flex-wrap gap-2'>
                    {data.scenes.map((s, i) => (
                      <Button key={i} size='sm' variant={i === sceneIndex ? 'default' : 'outline'} onClick={() => setSceneIndex(i)}>
                        {s.sceneName}
                      </Button>
                    ))}
                  </div>
                )}
                <div className='overflow-hidden rounded-lg border'>
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-card hover:bg-card'>
                        <TableHead className='text-muted-foreground w-56'>Ô</TableHead>
                        <TableHead className='text-muted-foreground'>Giá trị</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(scene.variables ?? {}).map(([key, v]) => (
                        <TableRow key={key}>
                          <TableCell>
                            <div className='font-medium'>{v.displayName || key}</div>
                            <div className='text-muted-foreground font-mono text-xs'>{key}</div>
                          </TableCell>
                          <TableCell className='text-sm break-all'>
                            {v.assetId ? <span className='text-muted-foreground mr-2 text-xs'>Thiết kế #{v.assetId}</span> : null}
                            {v.value || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <p className='text-muted-foreground text-sm'>CG scene chưa có nội dung scene.</p>
            )}
          </div>

          <div className='space-y-6'>
            <div className='space-y-2'>
              <h3 className='border-b pb-2 text-sm font-semibold'>Thông tin</h3>
              {data.fields.length === 0 && <p className='text-muted-foreground text-sm'>Không có thông tin</p>}
              {data.fields.map((f) => (
                <div key={f.fieldName} className='flex gap-3 text-sm'>
                  <span className='text-muted-foreground w-32 shrink-0 text-xs'>{f.displayName}</span>
                  <span className='break-all'>{f.value || '—'}</span>
                </div>
              ))}
            </div>

            {actions.length > 0 && (
              <div className='space-y-3'>
                <h3 className='border-b pb-2 text-sm font-semibold'>Xử lý quy trình</h3>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder='Nhập ý kiến...'
                  className='min-h-20 text-sm'
                  aria-label='Ý kiến'
                />
                <div className='flex flex-wrap gap-2'>
                  {actions.map((action) => (
                    <Button
                      key={action.id}
                      size='sm'
                      disabled={approve.isPending || action.requireUpload}
                      title={action.requireUpload ? 'Hành động yêu cầu tải lên file' : undefined}
                      onClick={() => runAction(action.id)}
                    >
                      {approve.isPending && <Loader2 className='h-3 w-3 animate-spin' />}
                      {action.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <h3 className='border-b pb-2 text-sm font-semibold'>Lịch sử quy trình</h3>
              {histories.length === 0 ? (
                <p className='text-muted-foreground text-sm'>Chưa có lịch sử</p>
              ) : (
                <div className='overflow-hidden rounded-lg border text-xs'>
                  <table className='w-full'>
                    <thead className='bg-background border-b'>
                      <tr>
                        <th className='px-2 py-2 text-left font-medium'>Trạng thái</th>
                        <th className='px-2 py-2 text-left font-medium'>Người thực hiện</th>
                        <th className='px-2 py-2 text-left font-medium'>Hành động</th>
                        <th className='px-2 py-2 text-left font-medium'>Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {histories.map((h, i) => (
                        <tr key={h.id ?? i} className={cn('border-b', i % 2 === 0 ? 'bg-background' : 'bg-accent')} title={h.comment || undefined}>
                          <td className='px-2 py-1' style={{ color: h.color }}>{h.status}</td>
                          <td className='px-2 py-1'>{h.assignedBy}</td>
                          <td className='px-2 py-1 font-medium'>{h.action}</td>
                          <td className='px-2 py-1'>{h.actionTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Main>
  )
}
