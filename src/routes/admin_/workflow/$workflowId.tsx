import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/require-auth'
import { WorkflowEditorView } from '@/features/admin/workflow/editor'

// Trình soạn workflow hiển thị toàn màn hình, nằm ngoài AdminLayout
export const Route = createFileRoute('/admin_/workflow/$workflowId')({
  beforeLoad: ({ location }) => requireAuth(location),
  component: WorkflowEditorPage,
})

function WorkflowEditorPage() {
  const { workflowId } = Route.useParams()
  const navigate = useNavigate()

  return (
    <WorkflowEditorView
      workflowId={workflowId}
      onBack={() => navigate({ to: '/admin/workflow' })}
    />
  )
}
