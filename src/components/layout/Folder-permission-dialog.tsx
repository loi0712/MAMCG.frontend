import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Save, Trash2, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { joinIds } from '@/features/admin/api/common'
import {
  type Permission,
  type TargetType,
  flattenPermissionIds,
  parsePermissionIds,
  useFolderPermissions,
  useSaveFolderPermissions,
} from '@/features/admin/api/permissions'
import { PermissionNode } from '@/features/admin/permissions'

type Entry = {
  targetType: TargetType
  targetId: string
  ids: Set<number>
}

const keyOf = (e: { targetType: TargetType; targetId: string }) => `${e.targetType}:${e.targetId}`

type FolderPermissionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: { id: string; name: string } | null
}

// Phân quyền theo thư mục (chỉ quản trị viên): mỗi người dùng/nhóm một danh sách quyền trên thư mục này
export function FolderPermissionDialog({ open, onOpenChange, folder }: FolderPermissionDialogProps) {
  const { data, isLoading, isError } = useFolderPermissions(open && folder ? folder.id : null)
  const save = useSaveFolderPermissions()

  const [entries, setEntries] = useState<Entry[]>([])
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [newType, setNewType] = useState<TargetType>('GROUP')
  const [newTarget, setNewTarget] = useState<string>('')

  // Nạp quyền hiện có khi mở dialog / tải xong
  useEffect(() => {
    if (!open || !data) return
    const loaded = data.folderPermission
      .filter((p) => p.targetId)
      .map((p) => ({ targetType: p.targetType, targetId: p.targetId!, ids: new Set(parsePermissionIds(p.permissionIds)) }))
    setEntries(loaded)
    setActiveKey(loaded[0] ? keyOf(loaded[0]) : null)
    setNewTarget('')
  }, [open, data])

  const nameOf = useMemo(() => {
    const users = new Map((data?.users ?? []).map((u) => [u.id.toLowerCase(), `${u.fullName ?? u.username} (${u.username})`]))
    const groups = new Map((data?.groups ?? []).map((g) => [String(g.id), g.name ?? `Nhóm #${g.id}`]))
    return (e: { targetType: TargetType; targetId: string }) =>
      (e.targetType === 'USER' ? users.get(e.targetId.toLowerCase()) : groups.get(e.targetId)) ??
      `${e.targetType === 'USER' ? 'Người dùng' : 'Nhóm'} ${e.targetId}`
  }, [data])

  const candidates = useMemo(() => {
    const used = new Set(entries.map(keyOf))
    const list =
      newType === 'USER'
        ? (data?.users ?? []).map((u) => ({ id: u.id, label: `${u.fullName ?? u.username} (${u.username})` }))
        : (data?.groups ?? []).map((g) => ({ id: String(g.id), label: g.name ?? `Nhóm #${g.id}` }))
    return list.filter((c) => !used.has(keyOf({ targetType: newType, targetId: c.id })))
  }, [data, entries, newType])

  const tree = data?.permissionTree ?? []
  const active = entries.find((e) => keyOf(e) === activeKey) ?? null

  const addEntry = () => {
    if (!newTarget) return
    const entry: Entry = { targetType: newType, targetId: newTarget, ids: new Set() }
    setEntries((prev) => [...prev, entry])
    setActiveKey(keyOf(entry))
    setNewTarget('')
  }

  const removeEntry = (key: string) => {
    setEntries((prev) => prev.filter((e) => keyOf(e) !== key))
    if (activeKey === key) setActiveKey(null)
  }

  const toggle = (node: Permission, checked: boolean) => {
    if (!active) return
    // Chọn/bỏ một nhóm quyền áp dụng cho cả các quyền con
    const ids = [node.id, ...flattenPermissionIds(node.childrens ?? [])]
    setEntries((prev) =>
      prev.map((e) => {
        if (keyOf(e) !== activeKey) return e
        const next = new Set(e.ids)
        ids.forEach((id) => (checked ? next.add(id) : next.delete(id)))
        return { ...e, ids: next }
      })
    )
  }

  const submit = async () => {
    if (!folder) return
    try {
      await save.mutateAsync({
      folderId: Number(folder.id),
      // Đối tượng không còn quyền nào thì không gửi (tương đương gỡ quyền)
      permissions: entries
        .filter((e) => e.ids.size > 0)
        .map((e) => ({
          targetType: e.targetType,
          targetId: e.targetId,
          permissionIds: joinIds([...e.ids].sort((a, b) => a - b)),
        })),
      })
      onOpenChange(false)
    } catch {
      // Lỗi đã được báo qua toast (mutations.onError)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Phân quyền thư mục</DialogTitle>
          <DialogDescription>
            Thư mục <b>{folder?.name}</b>. Quyền quản trị hệ thống không gán theo thư mục.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <p className='text-muted-foreground flex items-center justify-center gap-2 p-8 text-sm'>
            <Loader2 className='h-4 w-4 animate-spin' /> Đang tải...
          </p>
        )}
        {isError && <p className='text-destructive p-8 text-center text-sm'>Không tải được phân quyền. Vui lòng thử lại.</p>}

        {data && (
          <div className='grid gap-4 md:grid-cols-[260px_1fr]'>
            {/* Người dùng/nhóm có quyền trên thư mục */}
            <div className='space-y-3'>
              <div className='grid gap-2'>
                <Label>Thêm người dùng/nhóm</Label>
                <Select
                  value={newType}
                  onValueChange={(v) => {
                    setNewType(v as TargetType)
                    setNewTarget('')
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='GROUP'>Nhóm quyền</SelectItem>
                    <SelectItem value='USER'>Người dùng</SelectItem>
                  </SelectContent>
                </Select>
                <div className='flex gap-2'>
                  <Select value={newTarget} onValueChange={setNewTarget}>
                    <SelectTrigger className='w-full min-w-0' aria-label='Chọn đối tượng'>
                      <SelectValue placeholder='Chọn...' />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.length === 0 && (
                        <div className='text-muted-foreground px-2 py-1.5 text-sm'>Không còn lựa chọn</div>
                      )}
                      {candidates.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type='button' size='icon' variant='outline' aria-label='Thêm' disabled={!newTarget} onClick={addEntry}>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              <ScrollArea className='h-72 rounded-md border'>
                {entries.length === 0 && (
                  <p className='text-muted-foreground p-4 text-center text-sm'>Chưa phân quyền riêng cho thư mục này.</p>
                )}
                {entries.map((e) => {
                  const key = keyOf(e)
                  const Icon = e.targetType === 'USER' ? User : Users
                  return (
                    <div
                      key={key}
                      role='button'
                      tabIndex={0}
                      onClick={() => setActiveKey(key)}
                      onKeyDown={(ev) => ev.key === 'Enter' && setActiveKey(key)}
                      className={cn(
                        'hover:bg-accent flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-sm last:border-b-0',
                        key === activeKey && 'bg-accent'
                      )}
                    >
                      <Icon className='text-muted-foreground h-4 w-4 shrink-0' />
                      <span className='min-w-0 flex-1 truncate'>{nameOf(e)}</span>
                      <Badge variant={e.ids.size ? 'secondary' : 'outline'}>{e.ids.size}</Badge>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        aria-label='Gỡ'
                        onClick={(ev) => {
                          ev.stopPropagation()
                          removeEntry(key)
                        }}
                      >
                        <Trash2 className='text-destructive h-3.5 w-3.5' />
                      </Button>
                    </div>
                  )
                })}
              </ScrollArea>
            </div>

            {/* Quyền của đối tượng đang chọn */}
            <div className='rounded-md border p-2'>
              {!active && (
                <p className='text-muted-foreground p-6 text-center text-sm'>Chọn người dùng/nhóm bên trái để chỉnh quyền.</p>
              )}
              {active && tree.length === 0 && (
                <p className='text-muted-foreground p-6 text-center text-sm'>Chưa có quyền nào gán được theo thư mục.</p>
              )}
              {active && tree.length > 0 && (
                <ScrollArea className='h-[21rem]'>
                  <div className='px-2 pb-2 text-sm font-medium'>{nameOf(active)}</div>
                  {tree.map((node) => (
                    <PermissionNode key={node.id} node={node} selected={active.ids} onToggle={toggle} />
                  ))}
                </ScrollArea>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type='button' onClick={submit} disabled={!data || save.isPending}>
            {save.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
            Lưu phân quyền
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
