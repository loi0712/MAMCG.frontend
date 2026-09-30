import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { type EmailPreviewRequest, usePreviewEmailTemplate } from '../../api/email-templates'

type EmailTemplatePreviewProps = {
  subject: string
  body: string
  isHtml: boolean
  code?: string
}

// Xem trước (gọi API preview sau 400ms kể từ lần gõ cuối) với biến mẫu của sự kiện theo mã mẫu
export function EmailTemplatePreview({ subject, body, isHtml, code }: EmailTemplatePreviewProps) {
  const [request, setRequest] = useState<EmailPreviewRequest | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setRequest({ subject, body, isHtml, code: code?.trim() || null }), 400)
    return () => clearTimeout(timer)
  }, [subject, body, isHtml, code])

  const { data, isFetching, isError } = usePreviewEmailTemplate(request)
  const missing = data?.missingVariables ?? []

  return (
    <div className='flex h-full min-h-0 flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <span className='text-sm text-primary'>Xem trước (dữ liệu mẫu)</span>
        {isFetching && <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />}
      </div>

      {isError && !data && <div className='text-destructive text-sm'>Không xem trước được nội dung.</div>}

      {missing.length > 0 && (
        <div className='flex items-start gap-2 rounded border border-yellow-500/50 bg-yellow-500/10 p-2 text-xs text-yellow-500'>
          <AlertTriangle className='mt-0.5 h-3.5 w-3.5 shrink-0' />
          <span>
            Biến không có dữ liệu mẫu (sẽ để trống khi gửi nếu sự kiện không cung cấp):{' '}
            {missing.map((v) => (
              <code key={v} className='mr-1'>
                {`{{${v}}}`}
              </code>
            ))}
          </span>
        </div>
      )}

      <div className='rounded border border-border bg-muted px-3 py-2 text-sm'>
        <span className='text-muted-foreground'>Tiêu đề: </span>
        <span className='text-foreground break-words'>{data?.subject || '—'}</span>
      </div>

      <div className='min-h-[320px] flex-1 overflow-hidden rounded border border-border bg-white'>
        {data?.isHtml ? (
          // sandbox rỗng: không chạy script, không điều hướng, không truy cập trang quản trị
          <iframe title='Xem trước email' sandbox='' srcDoc={data.body ?? ''} className='h-full min-h-[320px] w-full' />
        ) : (
          <pre className='h-full overflow-auto p-3 text-sm whitespace-pre-wrap text-neutral-900'>{data?.body ?? ''}</pre>
        )}
      </div>
    </div>
  )
}
