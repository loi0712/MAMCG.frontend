import { Badge } from '@/components/ui/badge'
import { isServiceStatus, SERVICE_STATUS } from '../../api/system'

export function ServiceStatusBadge({ status }: { status: string | null | undefined }) {
  const cfg = isServiceStatus(status)
    ? SERVICE_STATUS[status]
    : { label: status ?? '—', className: 'border-border text-muted-foreground' }
  return (
    <Badge variant='outline' className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}
