import { Badge } from '@/components/ui/badge'
import { AUDIT_ACTION_LABELS, type AuditAction } from '../../api/logs'

const ACTION_CLASS: Record<AuditAction, string> = {
  create: 'border-green-500 text-green-400',
  update: 'border-blue-500 text-blue-400',
  delete: 'border-red-500 text-red-400',
}

export function AuditActionBadge({ action }: { action: AuditAction }) {
  return (
    <Badge variant='outline' className={ACTION_CLASS[action] ?? 'border-border text-muted-foreground'}>
      {AUDIT_ACTION_LABELS[action] ?? action}
    </Badge>
  )
}
