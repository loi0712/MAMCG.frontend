// components/assets/PreviewDrawer.tsx
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
} from "@/components/ui/drawer"
import { ArrowRightFromLine, Loader2, Maximize2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { AssetDetailResponse, fetchAssetDetail, Field, getDisplayValue, WorkflowHistory } from "../api/get-asset"
import { parseDatasource } from "../api/create"
import { env } from "@/config/env"
import { useNavigate } from "@tanstack/react-router"
import { DynamicForm as DynamicFormArray } from '@/components/dynamic-form'

interface PreviewDrawerProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    assetId: string
    onAssetUpdated?: () => Promise<void>
}

const PreviewDrawer = ({
    isOpen,
    onOpenChange,
    assetId,
}: PreviewDrawerProps) => {
    // States
    const [assetDetail, setAssetDetail] = useState<AssetDetailResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

    // Load asset detail when drawer opens
    useEffect(() => {
        if (isOpen && assetId) {
            loadAssetDetail(assetId)
        }
    }, [isOpen, assetId])

    // Initialize field values when data loads
    useEffect(() => {
        if (assetDetail) {
            const initialValues: Record<string, string> = {}
            assetDetail.panels.forEach(panel => {
                panel.fields.forEach(field => {
                    initialValues[field.fieldName] = field.value
                })
            })
            setFieldValues(initialValues)
        }
    }, [assetDetail])

    const loadAssetDetail = async (id: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const detail = await fetchAssetDetail(id)
            setAssetDetail(detail)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu')
        } finally {
            setIsLoading(false)
        }
    }

    const navigate = useNavigate();

    const handleExpand = useCallback(() => {
        if (!assetId) {
            console.error('Cannot navigate: No asset ID available');
            return;
        }

        navigate({
            to: '/assets/details/details',
            search: {
                id: assetId,
            },
        });
    }, [navigate, assetId]);

    const handleFieldChange = (fieldName: string, value: string) => {
        setFieldValues(prev => ({
            ...prev,
            [fieldName]: value
        }))
    }

    const handleClose = () => {
        onOpenChange(false)
        setAssetDetail(null)
        setFieldValues({})
        setError(null)
    }

    // Get thumbnail field
    const getThumbnailField = () => {
        if (!assetDetail) return null

        for (const panel of assetDetail.panels) {
            const thumbnailField = panel.fields.find(field =>
                field.fieldName === 'thumbnail' ||
                field.dataType.name === 'image'
            )
            if (thumbnailField) return thumbnailField.value
        }
        return null
    }

    // Get asset name/title
    const getAssetName = () => {
        if (!assetDetail) return 'Chi tiết thiết kế'

        // Try to find a name field
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

        return assetDetail.asset.name || 'Chi tiết thiết kế'
    }

    const historyData = useMemo((): WorkflowHistory[] => {
        if (!assetDetail) return []

        return assetDetail.asset.workflowItem.histories
    }, [assetDetail])

    const renderFormField = (field: Field) => {
        const value = fieldValues[field.fieldName] || ''
        const options = parseDatasource(field.dataType.datasource)

        if (!field.editable) {
            // Read-only field
            let displayValue = value

            if (field.dataType.datasource) {
                displayValue = getDisplayValue(value, field.dataType.datasource)
            }

            return (
                <div className="space-y-1">
                    <label className="text-sm font-medium">
                        {field.displayName}:

                    </label>
                    <div className="px-3 py-2 rounded-md text-sm  border">
                        {displayValue || '—'}
                    </div>
                </div>
            )
        }

        // Editable fields based on type
        switch (field.dataType.name) {
            case 'singleline':
                return (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            {field.displayName}:

                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required={field.isRequired}
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
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            {field.displayName}:
                        </label>
                        <div className="w-full">
                            <DynamicFormArray
                                value={tableData}
                                disabled={true} // Disable editing in preview view
                            />
                        </div>
                    </div>
                );
            }

            default:
                return (field.dataType.datasource != null) ?
                    (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                {field.displayName}:

                            </label>
                            <select
                                value={value}
                                onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required={field.isRequired}
                                disabled={true}
                            >
                                <option value="">Chọn...</option>
                                {options.map((option, idx) => (
                                    <option key={`${option.Id}-${idx}`} value={option.Id}>
                                        {option.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )
                    : (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                {field.displayName}:
                            </label>
                            <div className="px-3 py-2 rounded-md text-sm border">
                                {value || '—'}
                            </div>
                        </div>
                    )
        }
    }

    if (!assetId) return null

    const thumbnailField = getThumbnailField()
    const assetName = getAssetName()


    return (
        <Drawer
            direction="right"
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            <DrawerContent className="bottom-2 left-auto right-2 top-2 mt-0 w-[50%] overflow-hidden rounded-[10px] border-l shadow-xl">
                <div className="bg-background h-full w-full flex flex-col">
                    {/* Header */}
                    <DrawerHeader className="flex items-center justify-between border-b pt-0 pb-0.5">
                        <div className="inline-flex rounded-md" role="group">
                            <Button variant="ghost" size="icon" onClick={handleClose}
                                className="rounded-r-none border-r">
                                <ArrowRightFromLine className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleExpand}
                                className="rounded-l-none">
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div >
                            <h1>{assetName}</h1>
                        </div>
                    </DrawerHeader>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center space-y-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="p-6 text-center space-y-4">
                                <p className="text-sm text-red-600">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => assetId && loadAssetDetail(assetId)}
                                >
                                    Thử lại
                                </Button>
                            </div>
                        )}

                        {/* Asset Content */}
                        {assetDetail && !isLoading && (
                            <div className="p-6 space-y-6">
                                {/* Thumbnail Section */}
                                <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                    {thumbnailField ? (
                                        <img
                                            src={env.apiUrl + '' + thumbnailField}
                                            alt="Asset preview"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {/* Default preview content based on image */}
                                            <div className="flex items-center space-x-2">
                                                <div className="bg-red-500 px-8 py-2 text-white font-bold transform -skew-x-12">
                                                    LIVE
                                                </div>
                                                <div className="bg-white px-16 py-2 text-black font-bold transform -skew-x-12">
                                                    NEWS
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Form Fields */}
                                <div className="rounded-lg p-6 shadow-sm border">
                                    <h3 className=" mb-4">Thông tin chi tiết</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        {assetDetail.panels.flatMap(panel =>
                                            panel.fields.filter(field =>
                                                field.fieldName !== 'Thumbnail' &&
                                                field.dataType.name !== 'image'
                                            )
                                        ).map((field, idx) => (
                                            <div key={`${field.id}-${idx}`} className={cn(
                                                field.dataType.name === 'multiline' ? 'col-span-2' : ''
                                            )}>
                                                {renderFormField(field)}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* History Section */}
                                <div className="rounded-lg p-6 shadow-sm border">
                                    <h4 className="font-semibold mb-4">Lịch sử dự án:</h4>

                                    <table className="w-full overflow-y-auto text-xs border">
                                        <thead className="sticky bg-card top-0 border-b">
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
                                                    <td className="py-1 px-2 ">{item.status}</td>
                                                    <td className="py-1 px-2 ">{item.assignedBy}</td>
                                                    <td className="py-1 px-2">
                                                        <span className="font-medium ">{item.action}</span>
                                                    </td>
                                                    <td className="py-1 px-2">{item.actionTime}</td>
                                                    <td className="py-1 px-2">{item.comment}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default PreviewDrawer
