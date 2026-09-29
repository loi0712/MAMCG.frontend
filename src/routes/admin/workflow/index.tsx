import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { WorkflowView } from '@/features/admin/workflow'

export const Route = createFileRoute('/admin/workflow/')({
  component: WorkflowPage,
})

function WorkflowPage() {
  const navigate = useNavigate()

  return (
    <WorkflowView
      onEditWorkflow={(workflowId) =>
        navigate({ to: '/admin/workflow/$workflowId', params: { workflowId } })
      }
    />
  )
}
