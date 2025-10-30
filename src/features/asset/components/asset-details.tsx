// src/features/asset/components/asset-details.tsx
import { useEffect, useState, useMemo, useCallback } from "react"
import { getRouteApi } from '@tanstack/react-router'
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form'
import { MultiSelect } from "@/components/multi-select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ChevronLeft, Play, Pause, ChevronRight, X } from "lucide-react"
import {
    AssetDetailResponse,
    fetchAssetDetail,
    Field,
    getDisplayValue,
    WorkflowHistory,
} from "../api/get-asset"
import { parseDatasource } from "../api/create"
import { env } from "@/config/env"
import { cn } from "@/shared/lib/utils"
import { transformFormValuesForUpdate, useUpdateAssetWithCallbacks } from "../api/update-asset"
import { toast } from "sonner"
import JSZip from "jszip"
import { SelectDropdown } from "@/components/select-dropdown"
import { DynamicForm as DynamicFormArray } from '@/components/dynamic-form'

// Get route API for the details route
const routeApi = getRouteApi('/_authenticated/assets/details/details')

// ============= TYPE DEFINITIONS =============
interface DynamicFormValues {
    [key: string]: string | string[] | undefined
    comment?: string
}

interface DynamicFormFieldProps {
    field: Field
}

interface MediaPreview {
    url: string
    type: 'image' | 'video'
    name: string
    file: File | null
}

// ============= DYNAMIC FORM FIELD COMPONENT =============
const DynamicFormField: React.FC<DynamicFormFieldProps> = ({ field }) => {
    const { register, watch, control } = useFormContext<DynamicFormValues>()
    const value = watch(field.fieldName) || ''
    const options = useMemo(() => parseDatasource(field.dataType.datasource), [field.dataType.datasource])

    // Non-editable field display
    if (!field.editable) {
        let displayValue = value
        if (field.dataType.datasource && value) {
            if (Array.isArray(value)) {
                displayValue = value.map(v => getDisplayValue(v, field.dataType.datasource));
            } else {
                displayValue = getDisplayValue(value, field.dataType.datasource);
            }
        }

        return (
            <div className="flex items-center space-x-3 w-full">
                <label className="text-xs font-medium w-24 flex-shrink-0">
                    {field.displayName}
                    {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="flex-1 px-2 py-1.5 rounded-md text-xs border">
                    {Array.isArray(displayValue) ? displayValue.join(', ') : displayValue || '—'}
                </div>
            </div>
        )
    }

    // Editable fields based on data type
    switch (field.dataType.name) {
        case 'singleline':
            return (
                <div className="flex items-center space-x-3 w-full">
                    <label className="text-xs w-24 font-medium flex-shrink-0">
                        {field.displayName}:
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                        type="text"
                        {...register(field.fieldName, {
                            required: field.isRequired ? `${field.displayName} là bắt buộc` : false
                        })}
                        className="flex-1 w-3 px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            )

        case 'multiline':
            return (
                <div className="flex items-center space-x-3 w-full">
                    <label className="text-xs font-medium w-24">
                        {field.displayName}:
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <textarea
                        {...register(field.fieldName, {
                            required: field.isRequired ? `${field.displayName} là bắt buộc` : false
                        })}
                        rows={2}
                        className="flex-1 w-3 px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            )

        case 'user':
            return field.fieldName == 'Designer' ? (
                <div className="flex items-center space-x-3 w-full">
                    <label className="text-xs font-medium w-24 flex-shrink-0">
                        {field.displayName}:
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <Controller
                        control={control}
                        name={field.fieldName}
                        rules={{ required: field.isRequired ? `${field.displayName} là bắt buộc` : false }}
                        render={({ field: { onChange, value } }) => (
                            <MultiSelect
                                onValueChange={(values) => onChange(values.join(','))}
                                defaultValue={typeof value === 'string' ? value.split(',') : []}
                                placeholder={`Chọn ${field.displayName.toLowerCase()}`}
                                options={options.map(o => ({ label: o.Name, value: o.Id }))}
                                autoSize={false}
                                className="w-full"
                            />
                        )}
                    />
                </div>) : (
                <div className="flex items-center space-x-3 w-full">
                    <label className="text-xs font-medium w-24 flex-shrink-0">
                        {field.displayName}:
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <Controller
                        control={control}
                        name={field.fieldName}
                        rules={{ required: field.isRequired ? `${field.displayName} là bắt buộc` : false }}
                        render={({ field: { onChange, value } }) => (
                            <SelectDropdown
                                onValueChange={onChange}
                                defaultValue={value as string | undefined}
                                placeholder={`Chọn ${field.displayName.toLowerCase()}`}
                                items={options.map(o => ({ label: o.Name, value: o.Id }))}
                                className={"w-full"}
                            />
                        )}
                    />
                </div>
            )

        case 'table': {
            let tableData: { title: string; content: string }[] = [];
            if (typeof value === 'string' && value) {
                try {
                    tableData = JSON.parse(value);
                } catch (e) {
                    console.error("Failed to parse table data:", e);
                }
            }

            return (
                <div className="flex items-start space-x-3 w-full">
                    <label className="text-xs font-medium w-24 flex-shrink-0 pt-1.5">
                        {field.displayName}
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="flex-1">
                        <DynamicFormArray
                            value={tableData}
                            disabled={true} // Disable editing in details view
                        />
                    </div>
                </div>
            );
        }

        default:
            return field.dataType.datasource != null ? (
                <div className="flex items-center space-x-3 w-full">
                    <label className="text-xs font-medium w-24 flex-shrink-0">
                        {field.displayName}:
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <select
                        {...register(field.fieldName, {
                            required: field.isRequired ? `${field.displayName} là bắt buộc` : false
                        })}
                        className="flex-1 px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Chọn...</option>
                        {options.map((option) => (
                            <option key={option.Id} value={option.Id}>
                                {option.Name}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="flex items-center space-x-3 w-full">
                    <label className="text-xs font-medium w-24 flex-shrink-0">
                        {field.displayName}:
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                        type="text"
                        {...register(field.fieldName, {
                            required: field.isRequired ? `${field.displayName} là bắt buộc` : false
                        })}
                        className="flex-1 px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            )
    }
}

// ============= CUSTOM HOOK FOR FORM =============
const useAssetDetailForm = (assetDetail: AssetDetailResponse | null) => {
    // Create default values from panels
    const defaultValues = useMemo(() => {
        if (!assetDetail) return { comment: '' }

        const values: DynamicFormValues = { comment: '' }

        assetDetail.panels.forEach(panel => {
            panel.fields.forEach(field => {
                values[field.fieldName] = field.value || ''
            })
        })

        return values
    }, [assetDetail])

    const methods = useForm<DynamicFormValues>({
        defaultValues,
        mode: 'onBlur'
    })

    // Reset form when assetDetail changes
    useEffect(() => {
        if (assetDetail) {
            methods.reset(defaultValues)
        }
    }, [assetDetail, defaultValues, methods])

    return methods
}

// ============= MAIN COMPONENT =============
export function AssetDetailPage() {
    // Use route hooks through routeApi
    const search = routeApi.useSearch()

    // Safely extract and decode the asset ID from search parameters
    const assetId = useMemo(() => {
        try {
            if (!search?.id) return null

            const rawId = String(search.id)
            const decodedId = decodeURIComponent(rawId).replace(/^"|"$/g, '')

            return decodedId || null
        } catch (error) {
            console.error('Error parsing asset ID from URL:', error)
            return null
        }
    }, [search?.id])

    // Local state
    const [assetDetail, setAssetDetail] = useState<AssetDetailResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Media preview states
    const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [slideshowInterval, setSlideshowInterval] = useState<NodeJS.Timeout | null>(null)

    // Initialize React Hook Form
    const methods = useAssetDetailForm(assetDetail)

    useEffect(() => {
        return () => {
            mediaPreviews.forEach(media => {
                if (media.url.startsWith('blob:')) {
                    URL.revokeObjectURL(media.url)
                }
            })
        }
    }, [mediaPreviews])

    // Load asset detail
    const loadAssetDetail = useCallback(async (id: string) => {
        if (!id) {
            setError('Asset ID không hợp lệ')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const detail = await fetchAssetDetail(id)
            setAssetDetail(detail)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu'
            setError(errorMessage)
            console.error('Failed to load asset detail:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Load asset detail when assetId changes
    useEffect(() => {
        if (assetId) {
            loadAssetDetail(assetId)
        } else if (assetId === null && search?.id) {
            setError('Asset ID trong URL không hợp lệ')
        }
    }, [assetId, loadAssetDetail, search?.id])

    // Handle back button
    const handleBack = useCallback(() => {
        window.history.back()
    }, [])

    // ============= SLIDESHOW CONTROLS =============
    const [playSpeed] = useState(100)

    const startSlideshow = useCallback(() => {
        if (mediaPreviews.length === 0) return

        setIsPlaying(true)
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaPreviews.length)
        }, playSpeed)

        setSlideshowInterval(interval)
    }, [mediaPreviews.length, playSpeed])

    const stopSlideshow = useCallback(() => {
        setIsPlaying(false)
        if (slideshowInterval) {
            clearInterval(slideshowInterval)
            setSlideshowInterval(null)
        }
    }, [slideshowInterval])

    const togglePlayPause = () => {
        if (isPlaying) {
            stopSlideshow()
        } else {
            startSlideshow()
        }
    }

    const goToNext = () => {
        stopSlideshow()
        setCurrentIndex((prev) => (prev + 1) % mediaPreviews.length)
    }

    const goToPrevious = () => {
        stopSlideshow()
        setCurrentIndex((prev) => (prev - 1 + mediaPreviews.length) % mediaPreviews.length)
    }

    const removeMedia = (index: number) => {
        stopSlideshow()
        setMediaPreviews(prev => prev.filter((_, i) => i !== index))
        if (currentIndex >= index && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (slideshowInterval) {
                clearInterval(slideshowInterval)
            }
        }
    }, [slideshowInterval])

    useEffect(() => {
        if (!assetDetail?.asset?.filePath) return

        let filePaths: string | string[] | any = assetDetail.asset.filePath

        // Parse if it's a JSON string
        if (typeof filePaths === 'string' && filePaths.startsWith('[')) {
            try {
                filePaths = JSON.parse(filePaths)
            } catch (e) {
                console.error('Failed to parse filePaths:', e)
                filePaths = [filePaths]
            }
        }

        // Ensure it's an array
        const pathArray = Array.isArray(filePaths) ? filePaths : [filePaths]

        const existingMedia: MediaPreview[] = pathArray
            .filter(path => path && typeof path === 'string') // Filter valid paths
            .map((path, index) => {
                // Clean quotes from path
                const cleanPath = path.replace(/^"|"$/g, '')
                const detectedType = getMediaTypeFromUrl(cleanPath)
                const type: 'image' | 'video' = detectedType === 'video' ? 'video' : 'image'

                return {
                    url: `${env.apiUrl}${cleanPath}`,
                    type,
                    name: cleanPath.split('/').pop() || `Asset-${index + 1}`,
                    file: null
                }
            })

        setMediaPreviews(existingMedia)
    }, [assetDetail?.asset?.filePath])

    // ============= FILE UPLOAD HANDLER =============
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const newPreviews: MediaPreview[] = []

        try {
            // Xử lý tuần tự từng file
            for (const file of Array.from(files)) {
                const isImage = file.type.startsWith('image/')
                const isVideo = file.type.startsWith('video/')

                if (!isImage && !isVideo) {
                    toast.error(`File ${file.name} không hợp lệ`)
                    continue
                }

                // Đọc file để preview
                const url = URL.createObjectURL(file)

                newPreviews.push({
                    url,
                    type: isImage ? 'image' : 'video',
                    name: file.name,
                    file: file
                })
            }

            // Sort và thay thế hoàn toàn state cũ
            const sortedPreviews = newPreviews.sort((a, b) =>
                a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
            )

            setMediaPreviews(sortedPreviews)

            toast.success(`Đã tải ${newPreviews.length} file`)

            // Reset input để có thể upload lại cùng file
            e.target.value = ''
        } catch (error) {
            console.error('Lỗi xử lý file:', error)
            toast.error('Có lỗi xảy ra khi xử lý file')
        }
    }

    const updateMutation = useUpdateAssetWithCallbacks(
        (response) => {
            methods.setValue('comment', '')
            toast.success(response.message || 'Cập nhật thành công!')

            // Cleanup blob URLs
            mediaPreviews.forEach(media => {
                if (media.file !== null && media.url.startsWith('blob:')) {
                    URL.revokeObjectURL(media.url)
                }
            })

            // Reset states
            setMediaPreviews([])
            setCurrentIndex(0)
            setError(null)

            // Reload asset detail từ server
            if (assetId) {
                loadAssetDetail(assetId)
            }
        },
        (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
            toast.error(`Không thể gửi dữ liệu. ${errorMessage}`)
            console.error('Update failed:', error)
        }
    )

    const onSubmit = useCallback(async (data: DynamicFormValues, actionId: string, isRequireUpload: boolean) => {
        if (!assetDetail || !assetId) {
            console.warn('Cannot perform action: missing asset detail or ID')
            return
        }

        setError(null)

        const allFields = assetDetail.panels.flatMap(p => p.fields)
        const updateData = transformFormValuesForUpdate(
            data,
            allFields,
            actionId,
            data.comment
        )

        if (mediaPreviews.length > 0 && isRequireUpload) {
            try {
                // Filter only user-uploaded files (not null)
                const uploadedFiles = mediaPreviews.filter((media): media is MediaPreview & { file: File } =>
                    media.file !== null
                )

                if (uploadedFiles.length === 0) {
                    toast.warning('Không có file mới để upload')
                    return
                }

                if (uploadedFiles.length === 1) {
                    updateData.File = uploadedFiles[0].file
                    toast.info('Đang upload file...')
                } else {
                    toast.info(`Đang nén ${uploadedFiles.length} file...`)

                    const zip = new JSZip()

                    for (const media of uploadedFiles) {
                        const isCompressible =
                            media.type === 'video' ||
                            media.file.type.includes('jpeg') ||
                            media.file.type.includes('jpg') ||
                            media.file.type.includes('png')

                        zip.file(media.name, media.file, {
                            compression: isCompressible ? 'STORE' : 'DEFLATE'
                        })
                    }

                    const zipBlob = await zip.generateAsync({
                        type: 'blob',
                        compression: 'DEFLATE',
                        compressionOptions: { level: 6 }
                    })

                    updateData.File = new File([zipBlob], `media_${Date.now()}.zip`, {
                        type: 'application/zip'
                    })
                }
            } catch (error) {
                console.error('Error processing files:', error)
                toast.error('Có lỗi khi xử lý file')
                return
            }
        }

        updateMutation.mutate({ assetId, data: updateData })
    }, [assetDetail, assetId, updateMutation, mediaPreviews])

    const thumbnailField = useMemo((): string | null => {
        if (!assetDetail) return null

        let filePath = assetDetail.asset.filePath

        // Handle if it's an array
        if (Array.isArray(filePath)) {
            if (filePath.length === 0) return null
            filePath = filePath[0] // Get first element
        }

        // Handle if it's a JSON string like "[\"path\"]"
        if (typeof filePath === 'string' && filePath.startsWith('[')) {
            try {
                const parsed = JSON.parse(filePath)
                filePath = Array.isArray(parsed) ? parsed[0] : filePath
            } catch (e) {
                console.error('Failed to parse filePath:', e)
            }
        }

        // Clean up quotes if present: "path" -> path
        if (typeof filePath === 'string') {
            return filePath.replace(/^"|"$/g, '')
        }

        return null
    }, [assetDetail])

    const assetName = useMemo((): string => {
        if (!assetDetail) return 'Chi tiết thiết kế'

        for (const panel of assetDetail.panels) {
            const nameField = panel.fields.find(field =>
                field.fieldName.toLowerCase().includes('name') ||
                field.fieldName === 'AssetType' ||
                field.displayName.toLowerCase().includes('thiết kế')
            )

            if (nameField && nameField.value) {
                return getDisplayValue(nameField.value, nameField.dataType.datasource)
            }
        }

        return assetDetail.asset?.name || 'Chi tiết thiết kế'
    }, [assetDetail])

    const historyData = useMemo((): WorkflowHistory[] => {
        if (!assetDetail) return []
        return assetDetail.asset.workflowItem.histories
    }, [assetDetail])

    const hasActions = assetDetail?.asset.workflowItem.actions ?? []

    const getMediaTypeFromUrl = (url: string): 'image' | 'video' | 'unknown' => {
        if (!url) return 'unknown'

        // Lấy extension từ URL
        const extension = url.split('.').pop()?.toLowerCase() || ''

        // Danh sách video extensions
        const videoExtensions = [
            'mp4', 'webm', 'ogg', 'ogv', 'mov', 'avi',
            'wmv', 'flv', 'mkv', 'm4v', '3gp', '3g2'
        ]

        // Danh sách image extensions
        const imageExtensions = [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp',
            'svg', 'ico', 'tiff', 'tif'
        ]

        if (videoExtensions.includes(extension)) {
            return 'video'
        }

        if (imageExtensions.includes(extension)) {
            return 'image'
        }

        return 'unknown'
    }

    // ============= LOADING & ERROR STATES =============
    if (!assetId && search?.id) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-sm text-red-600">Asset ID trong URL không hợp lệ</p>
                    <Button variant="outline" size="sm" onClick={handleBack}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        )
    }

    if (error && !assetDetail && !isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-sm text-red-600">{error}</p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => assetId && loadAssetDetail(assetId)}
                        >
                            Thử lại
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleBack}>
                            Quay lại
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Đang tải...</span>
                </div>
            </div>
        )
    }

    if (!assetDetail) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-sm">Không tìm thấy thiết kế</p>
                    <Button variant="outline" size="sm" onClick={handleBack}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        )
    }

    // ============= MAIN RENDER =============
    return (
        <FormProvider {...methods}>
            <div className="h-full w-full">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    type="button"
                                    className="inline-flex text-red-400 hover:text-red-600"
                                    onClick={() => setError(null)}
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="w-full h-full">
                    <div className="flex gap-6 h-full">
                        {/* Left Column - Preview & History (60%) */}
                        <div className="flex flex-col h-full w-6/10 p-1">
                            <div className="flex items-center justify-between m-1">
                                {/* Bên trái */}
                                <div className="flex items-center gap-2">
                                    <button onClick={handleBack}>
                                        <ChevronLeft />
                                    </button>
                                    <h4 className="mb-1 font-bold border-l-1 pl-2">
                                        {assetName}
                                    </h4>
                                </div>

                                {/* Bên phải */}
                                <div className="flex items-center gap-2">
                                    {hasActions.some((action) => action.requireUpload) && (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                multiple
                                                hidden
                                                id="file-upload"
                                                onChange={handleFileUpload}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer font-medium text-sm"
                                            >
                                                Upload ({mediaPreviews.length})
                                            </label>
                                        </>
                                    )}
                                    <Button>View demo</Button>
                                </div>
                            </div>

                            {/* Large Preview - 70% */}
                            <div className="basis-[70%] bg-black rounded-lg relative ">
                                {mediaPreviews.length > 0 ? (
                                    <>
                                        {/* Main Preview Area */}
                                        <div className="w-full h-full flex items-center justify-center scrollbar-hide">
                                            {mediaPreviews[currentIndex].type === 'image' ? (
                                                <img
                                                    src={mediaPreviews[currentIndex].url}
                                                    alt={mediaPreviews[currentIndex].name}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            ) : (
                                                <video
                                                    src={mediaPreviews[currentIndex].url}
                                                    controls
                                                    className="max-w-full max-h-full object-contain"
                                                    onPlay={() => stopSlideshow()}
                                                >
                                                    Trình duyệt không hỗ trợ video
                                                </video>
                                            )}
                                        </div>

                                        {/* Counter */}
                                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                                            {currentIndex + 1} / {mediaPreviews.length}
                                        </div>
                                    </>
                                ) : thumbnailField ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        {(() => {
                                            const mediaType = getMediaTypeFromUrl(thumbnailField)
                                            const fullUrl = `${env.apiUrl}${thumbnailField}`

                                            if (mediaType === 'video') {
                                                return (
                                                    <video
                                                        src={fullUrl}
                                                        controls
                                                        className="max-w-full max-h-full object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none'
                                                        }}
                                                    >
                                                        Trình duyệt không hỗ trợ video
                                                    </video>
                                                )
                                            }

                                            // Default to image
                                            return (
                                                <img
                                                    src={fullUrl}
                                                    alt="Asset preview"
                                                    className="max-w-full max-h-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none'
                                                    }}
                                                />
                                            )
                                        })()}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="bg-red-500 px-8 py-2 text-white font-bold transform -skew-x-12">
                                                NO
                                            </div>
                                            <div className="bg-white px-16 py-2 text-black font-bold transform -skew-x-12">
                                                MEDIA
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center mt-1 w-full relative p-1">
                                {/* Center Section - Thumbnails */}
                                <div className="w-4/5">
                                    {mediaPreviews.length > 1 && (
                                        <div className="flex items-center gap-2 flex-shrink-0 overflow-auto p-2 border bg-black ">
                                            {mediaPreviews.map((media, index) => (
                                                <div
                                                    key={index}
                                                    className={cn(
                                                        "relative flex-shrink-0 w-10 h-10 rounded overflow-hidden border-2 transition-all cursor-pointer",
                                                        currentIndex === index
                                                            ? "border-blue-500 scale-110"
                                                            : "border-white/50 hover:border-white"
                                                    )}
                                                >
                                                    <button
                                                        onClick={() => {
                                                            stopSlideshow()
                                                            setCurrentIndex(index)
                                                        }}
                                                        className="w-full h-full"
                                                    >
                                                        {media.type === 'image' ? (
                                                            <img
                                                                src={media.url}
                                                                alt={media.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                                                <Play className="w-8 h-8 text-white" />
                                                            </div>
                                                        )}
                                                    </button>

                                                    {/* Remove button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeMedia(index)
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                    >
                                                        <X className="w-1 h-1" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right Section - Playback Controls */}
                                <div className="flex items-center justify-end flex-1 w-1/5">
                                    {mediaPreviews.length > 1 && (
                                        <>
                                            <button
                                                onClick={goToPrevious}
                                                className=" p-2 rounded disabled:opacity-50"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>

                                            <button
                                                onClick={togglePlayPause}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium flex items-center gap-2 text-sm"
                                            >
                                                {isPlaying ? (
                                                    <>
                                                        <Pause className="w-4 h-4" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={goToNext}
                                                className="p-2 rounded disabled:opacity-50"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* History Section - 25% */}
                            <div className="basis-[25%] overflow-y-auto text-xs mt-6 pb-6">
                                <div className="h-full flex flex-col">
                                    <h4 className="mb-1 font-medium">Lịch sử dự án</h4>
                                    <div className="flex-1 overflow-y-auto rounded-lg shadow-sm border">
                                        <table className="w-full overflow-y-auto">
                                            <thead className="sticky top-0 border-b bg-background">
                                                <tr>
                                                    <th className="text-left py-2 px-2 font-medium">Trạng thái</th>
                                                    <th className="text-left py-2 px-2 font-medium">Người thực hiện</th>
                                                    <th className="text-left py-2 px-2 font-medium">Hành động</th>
                                                    <th className="text-left py-2 px-2 font-medium">Thời gian</th>
                                                    <th className="text-left py-2 px-2 font-medium">Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historyData.map((item, index) => (
                                                    <tr
                                                        key={index}
                                                        className={cn(
                                                            "border-b border-gray-100 hover:bg-muted/50 transition-colors",
                                                            index % 2 === 0 ? "bg-background" : "bg-accent"
                                                        )}
                                                    >
                                                        <td className="py-1 px-2" style={{
                                                            color: item.color
                                                        }}>{item.status}</td>
                                                        <td className="py-1 px-2">{item.assignedBy}</td>
                                                        <td className="py-1 px-2">
                                                            <span className="font-medium">{item.action}</span>
                                                        </td>
                                                        <td className="py-1 px-2">{item.actionTime}</td>
                                                        <td className="py-1 px-2">{item.comment}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Form (40%) */}
                        <div className="flex flex-col space-y-6 border-l-1 w-4/10 h-full">
                            {/* Tabs Section - 70% */}
                            <Tabs
                                defaultValue={assetDetail.panels[0]?.id.toString()}
                                className="w-full gap-0 h-[70%] overflow-y-auto flex flex-col"
                            >
                                <TabsList className="flex w-full justify-start border-b bg-transparent flex-shrink-0 overflow-x-auto scrollbar-hide">
                                    {assetDetail.panels.map((panel, idx) => (
                                        <TabsTrigger
                                            key={`${panel.id}-${idx}`}
                                            value={panel.id.toString()}
                                            className={cn(
                                                "relative shrink-0 px-4 py-2 text-sm font-semibold text-[#081952] transition-all duration-300",
                                                "border-none rounded-none outline-none",
                                                "w-[80px] overflow-hidden whitespace-nowrap text-ellipsis",
                                                "data-[state=active]:w-auto data-[state=active]:min-w-[120px] data-[state=active]:max-w-[200px]",
                                                "data-[state=active]:overflow-visible data-[state=active]:text-clip",
                                                "after:absolute after:inset-x-0 after:-bottom-[1px] after:h-[2px] after:bg-foreground after:scale-x-0 after:transition-transform after:origin-left",
                                                "data-[state=active]:after:scale-x-100"
                                            )}
                                        >
                                            {panel.panelName}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                <div className="w-full">
                                    {assetDetail.panels.map((panel, idx) => (
                                        <TabsContent
                                            key={`${panel.id}-${idx}`}
                                            value={panel.id.toString()}
                                            className="rounded-b-lg p-6 overflow-y-auto flex-1"
                                        >
                                            <div className="space-y-4">
                                                {panel.fields
                                                    .map((field) => (
                                                        <DynamicFormField key={field.id} field={field} />
                                                    ))}
                                            </div>
                                        </TabsContent>
                                    ))}
                                </div>
                            </Tabs>

                            {/* Action Section - 30% */}
                            {hasActions.length > 0 && (
                                <div className="basis-[30%] p-6 flex flex-col">
                                    <h4 className="text-sm font-medium mb-2">Ý kiến</h4>
                                    <textarea
                                        {...methods.register('comment', {
                                            minLength: {
                                                value: 10,
                                                message: 'Ý kiến phải có ít nhất 10 ký tự'
                                            }
                                        })}
                                        className={`w-full border rounded p-2 flex-1 text-sm ${methods.formState.errors.comment ? 'border-red-500' : ''
                                            }`}
                                        placeholder="Nhập ý kiến..."
                                    />

                                    {methods.formState.errors.comment && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {methods.formState.errors.comment.message}
                                        </p>
                                    )}

                                    {mediaPreviews.length > 0 && hasActions.some((action) => action.requireUpload) && (
                                        <p className="text-xs text-gray-600 mt-2">
                                            {mediaPreviews.length} file sẽ được upload khi gửi
                                        </p>
                                    )}

                                    <div className="flex gap-2 mt-4">
                                        {hasActions.map((action, idx) => (
                                            <Button
                                                key={`${action.id}-${idx}`}
                                                type="button"
                                                className='space-x-1 h-8'
                                                disabled={isSaving}
                                                onClick={methods.handleSubmit((data) => onSubmit(data, action.id, action.requireUpload))}
                                            >
                                                {isSaving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                                {action.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </FormProvider>
    )
}
