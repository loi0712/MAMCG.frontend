import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Loader2, TvMinimalPlay } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/Main'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { type CGSceneVariable, type CGTemplate, useCGTemplates, useCreateCGScene } from '../api/cg-scenes'
import { AssetPicker, type PickedAsset } from './asset-picker'

// Tên scene được ghép vào đường dẫn lưu trữ → backend chỉ nhận [A-Za-z0-9._-], tối đa 100 ký tự
const SCENE_NAME = /^[A-Za-z0-9._-]{1,100}$/
const sceneNameError = (name: string) => {
  if (!name.trim()) return 'Vui lòng nhập tên scene'
  if (!SCENE_NAME.test(name) || name.includes('..') || name === '.')
    return 'Tên scene chỉ gồm chữ không dấu, số, ".", "_", "-" (tối đa 100 ký tự)'
  return null
}

type VariableState = { value: string; asset: PickedAsset | null }

export function CGSceneCreatePage() {
  const navigate = useNavigate()
  const templates = useCGTemplates()
  const createScene = useCreateCGScene()

  const [templateId, setTemplateId] = useState<number | null>(null)
  const [sceneName, setSceneName] = useState('')
  const [variables, setVariables] = useState<Record<string, VariableState>>({})
  const [submitted, setSubmitted] = useState(false)

  const template = useMemo(() => templates.data?.find((t) => t.id === templateId) ?? null, [templates.data, templateId])
  const templateVars = Object.entries(template?.jsonContent.Variables ?? {})

  const selectTemplate = (id: string) => {
    const t = templates.data?.find((x) => x.id === Number(id)) as CGTemplate | undefined
    setTemplateId(Number(id))
    setSceneName(t?.jsonContent.SceneName ?? '')
    setVariables(
      Object.fromEntries(Object.entries(t?.jsonContent.Variables ?? {}).map(([k, v]) => [k, { value: v.Value ?? '', asset: null }]))
    )
    setSubmitted(false)
  }

  const setVar = (key: string, patch: Partial<VariableState>) =>
    setVariables((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { value: '', asset: null }), ...patch } }))

  const nameError = sceneNameError(sceneName)
  const missingAssets = templateVars.filter(([k, v]) => v.IsRequiredAsset && !variables[k]?.asset)
  const assignedCount = Object.values(variables).filter((v) => v.asset).length
  const formError =
    !template
      ? 'Vui lòng chọn template'
      : nameError ??
        (missingAssets.length > 0
          ? `Chưa gán thiết kế cho: ${missingAssets.map(([k, v]) => v.DisplayName || k).join(', ')}`
          : assignedCount === 0
            ? 'Cần gán ít nhất 1 thiết kế (mã scene lấy theo mã thiết kế)'
            : null)

  const handleSubmit = async () => {
    setSubmitted(true)
    if (formError || !template) return
    const content = template.jsonContent
    const vars: Record<string, CGSceneVariable> = Object.fromEntries(
      Object.entries(content.Variables ?? {}).map(([key, v]) => {
        const state = variables[key]
        return [
          key,
          {
            displayName: v.DisplayName ?? key,
            isRequiredAsset: v.IsRequiredAsset ?? false,
            assetId: state?.asset?.id ?? null,
            value: state?.asset ? null : state?.value ?? v.Value ?? null,
            w: v.W ?? null,
            h: v.H ?? null,
            x: v.X ?? null,
            y: v.Y ?? null,
            color: v.Color ?? null,
          },
        ]
      })
    )
    try {
      const created = await createScene.mutateAsync({
        cgTemplateId: template.id,
        jsonContent: {
          sceneName: sceneName.trim(),
          folderPath: content.FolderPath,
          scenePath: content.ScenePath,
          previewPath: content.PreviewPath,
          background: content.Background ?? null,
          variables: vars,
        },
      })
      navigate({ to: '/cg-scenes/details', search: { id: String(created.id) } })
    } catch {
      // Lỗi đã được thông báo
    }
  }

  return (
    <Main>
      <div className='mx-auto max-w-4xl space-y-6 py-2'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' aria-label='Quay lại' onClick={() => navigate({ to: '/cg-scenes' })}>
            <ChevronLeft className='h-5 w-5' />
          </Button>
          <TvMinimalPlay className='text-muted-foreground h-5 w-5' />
          <h1 className='text-lg font-semibold'>Tạo CG scene từ template</h1>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Template *</Label>
            <Select value={templateId ? String(templateId) : ''} onValueChange={selectTemplate}>
              <SelectTrigger className='w-full' aria-label='Template'>
                <SelectValue placeholder={templates.isLoading ? 'Đang tải template...' : 'Chọn template CG'} />
              </SelectTrigger>
              <SelectContent>
                {(templates.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {templates.isError && <p className='text-destructive text-xs'>Không tải được danh sách template.</p>}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='scene-name'>Tên scene *</Label>
            <Input
              id='scene-name'
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value)}
              placeholder='VD: BanTin_18h'
              className='font-mono'
              aria-invalid={submitted && !!nameError}
              disabled={!template}
            />
            {submitted && template && nameError && <p className='text-destructive text-xs'>{nameError}</p>}
          </div>
        </div>

        {template && (
          <div className='space-y-2'>
            <Label>Các ô của template</Label>
            <div className='overflow-hidden rounded-lg border'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-card hover:bg-card'>
                    <TableHead className='text-muted-foreground w-48'>Ô</TableHead>
                    <TableHead className='text-muted-foreground w-28'>Kích thước</TableHead>
                    <TableHead className='text-muted-foreground'>Nội dung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templateVars.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className='text-muted-foreground h-16 text-center text-sm'>
                        Template không có biến nào
                      </TableCell>
                    </TableRow>
                  )}
                  {templateVars.map(([key, v]) => (
                    <TableRow key={key}>
                      <TableCell>
                        <div className='font-medium'>
                          {v.DisplayName || key}
                          {v.IsRequiredAsset && <span className='text-destructive ml-1'>*</span>}
                        </div>
                        <div className='text-muted-foreground font-mono text-xs'>{key}</div>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-xs'>
                        {v.W && v.H ? `${v.W}×${v.H}` : '—'}
                      </TableCell>
                      <TableCell>
                        {v.IsRequiredAsset ? (
                          <AssetPicker
                            value={variables[key]?.asset ?? null}
                            onChange={(asset) => setVar(key, { asset })}
                            invalid={submitted && !variables[key]?.asset}
                          />
                        ) : (
                          <Input
                            value={variables[key]?.value ?? ''}
                            onChange={(e) => setVar(key, { value: e.target.value })}
                            placeholder='Nhập nội dung'
                            aria-label={v.DisplayName || key}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className='text-muted-foreground text-xs'>
              Mã CG scene được tạo theo mã của thiết kế đầu tiên được gán. File của thiết kế sẽ được sao chép vào thư mục scene.
            </p>
          </div>
        )}

        <div className='flex items-center justify-end gap-3'>
          {submitted && formError && formError !== nameError && <p className='text-destructive text-sm'>{formError}</p>}
          <Button variant='outline' onClick={() => navigate({ to: '/cg-scenes' })} disabled={createScene.isPending}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={createScene.isPending || !template}>
            {createScene.isPending && <Loader2 className='h-4 w-4 animate-spin' />}
            Tạo CG scene
          </Button>
        </div>
      </div>
    </Main>
  )
}
