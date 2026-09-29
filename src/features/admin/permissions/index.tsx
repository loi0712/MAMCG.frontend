import { useEffect, useMemo, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALL_ITEMS, joinIds } from '../api/common'
import { useGroups } from '../api/groups'
import {
  type Permission,
  type TargetType,
  flattenPermissionIds,
  parsePermissionIds,
  useSavePermissions,
  useTargetPermissions,
} from '../api/permissions'
import { useUsers } from '../api/users'

type PermissionNodeProps = {
  node: Permission
  selected: Set<number>
  onToggle: (node: Permission, checked: boolean) => void
  depth?: number
}

function PermissionNode({ node, selected, onToggle, depth = 0 }: PermissionNodeProps) {
  const children = node.childrens ?? []
  return (
    <div>
      <Label
        className='hover:bg-accent flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 font-normal'
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        <Checkbox
          checked={selected.has(node.id)}
          onCheckedChange={(value) => onToggle(node, value === true)}
        />
        <span className={children.length ? 'font-medium' : undefined}>{node.name}</span>
        {node.description && <span className='text-muted-foreground text-xs'>{node.description}</span>}
      </Label>
      {children.map((child) => (
        <PermissionNode key={child.id} node={child} selected={selected} onToggle={onToggle} depth={depth + 1} />
      ))}
    </div>
  )
}

export function PermissionsView() {
  const [targetType, setTargetType] = useState<TargetType>('GROUP')
  const [targetId, setTargetId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const { data: usersData } = useUsers(ALL_ITEMS)
  const { data: groupsData } = useGroups(ALL_ITEMS)
  const { data, isLoading, isError } = useTargetPermissions(targetType, targetId)
  const savePermissions = useSavePermissions()

  const targets = useMemo(
    () =>
      targetType === 'USER'
        ? (usersData?.users ?? []).map((u) => ({ id: u.id, label: `${u.fullName} (${u.username})` }))
        : (groupsData?.groups ?? []).map((g) => ({ id: String(g.id), label: g.name ?? `#${g.id}` })),
    [targetType, usersData, groupsData]
  )

  // Nạp quyền hiện có mỗi khi đổi đối tượng
  useEffect(() => {
    setSelected(new Set(parsePermissionIds(data?.permission?.permissionIds)))
  }, [data])

  const tree = data?.permissionTree ?? []

  const toggle = (node: Permission, checked: boolean) => {
    // Chọn/bỏ một nhóm quyền áp dụng cho cả các quyền con
    const ids = [node.id, ...flattenPermissionIds(node.childrens ?? [])]
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)))
      return next
    })
  }

  const save = () => {
    if (!targetId || selected.size === 0) return
    savePermissions.mutate({
      targetType,
      targetId,
      permissionIds: joinIds([...selected].sort((a, b) => a - b)),
    })
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-end gap-4'>
        <div className='grid gap-2'>
          <Label>Phân quyền cho</Label>
          <Select
            value={targetType}
            onValueChange={(value) => {
              setTargetType(value as TargetType)
              setTargetId(null)
            }}
          >
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='GROUP'>Nhóm quyền</SelectItem>
              <SelectItem value='USER'>Người dùng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='grid gap-2'>
          <Label>{targetType === 'USER' ? 'Người dùng' : 'Nhóm'}</Label>
          <Select value={targetId ?? ''} onValueChange={setTargetId}>
            <SelectTrigger className='w-72'>
              <SelectValue placeholder='Chọn...' />
            </SelectTrigger>
            <SelectContent>
              {targets.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className='ms-auto'
          onClick={save}
          disabled={!targetId || selected.size === 0 || savePermissions.isPending}
        >
          <Save className='h-4 w-4' />
          Lưu phân quyền
        </Button>
      </div>

      <div className='rounded-md border p-2'>
        {!targetId && (
          <p className='text-muted-foreground p-6 text-center text-sm'>
            Chọn nhóm quyền hoặc người dùng để xem và chỉnh quyền.
          </p>
        )}
        {targetId && isLoading && (
          <p className='text-muted-foreground flex items-center justify-center gap-2 p-6 text-sm'>
            <Loader2 className='h-4 w-4 animate-spin' /> Đang tải...
          </p>
        )}
        {targetId && isError && (
          <p className='text-destructive p-6 text-center text-sm'>Không tải được quyền. Vui lòng thử lại.</p>
        )}
        {targetId && !isLoading && !isError && (
          <>
            {tree.map((node) => (
              <PermissionNode key={node.id} node={node} selected={selected} onToggle={toggle} />
            ))}
            <p className='text-muted-foreground border-t px-2 pt-2 text-xs'>
              Đã chọn {selected.size} quyền. Cần chọn ít nhất một quyền để lưu.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
