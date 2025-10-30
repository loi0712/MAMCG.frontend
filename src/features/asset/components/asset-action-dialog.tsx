'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { type ParsedAsset } from '../api/get-assets'
import { assetCategories, assetStatuses, assetTypes, fileFormats } from '../data/assets'
import { AssetImagePreview } from './asset-image-preview'

const formSchema = z.object({
    name: z.string().min(1, 'Tên thiết kế là bắt buộc.'),
    fileName: z.string().min(1, 'Tên file là bắt buộc.'),
    type: z.string().min(1, 'Loại thiết kế là bắt buộc.'),
    status: z.string().min(1, 'Trạng thái là bắt buộc.'),
    category: z.string().min(1, 'Chuyên mục là bắt buộc.'),
    projectName: z.string().optional(),
    description: z.string().optional(),
    duration: z.string().optional(),
    fileFormat: z.string().min(1, 'Định dạng file là bắt buộc.'),
    assignedTo: z.string().optional(),
    filePath: z.string().optional(),
    // Add image field for file upload
    image: z
        .union([
            z.instanceof(File, { message: 'Hình ảnh là bắt buộc' }),
            z.string().optional(), // Allow existing image URL for editing
        ])
        .optional()
        .refine((value) => {
            if (!value) return true // Optional field
            return value instanceof File || typeof value === 'string'
        }, {
            message: 'Định dạng hình ảnh không hợp lệ',
        }),
    isEdit: z.boolean(),
})

type AssetForm = z.infer<typeof formSchema>

type AssetsActionDialogProps = {
    currentRow?: ParsedAsset
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AssetsActionDialog({
    currentRow,
    open,
    onOpenChange,
}: AssetsActionDialogProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    
    const isImageAsset = currentRow?.thumbnail || /\.(jpg|jpeg|png|gif|webp)$/i.test(currentRow?.filePath || '')
    const isEdit = !!currentRow
    
    const form = useForm<AssetForm>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
            ? {
                name: currentRow.name || '',
                fileName: currentRow.fileName || '',
                type: currentRow.type || '',
                status: currentRow.status || '',
                category: currentRow.category || '',
                projectName: currentRow.projectName || '',
                description: currentRow.description || '',
                duration: currentRow.duration || '',
                fileFormat: currentRow.fileFormat || '',
                assignedTo: currentRow.assignedTo || '',
                filePath: currentRow.filePath || '',
                image:currentRow.thumbnail || currentRow.filePath || '',
                isEdit,
            }
            : {
                name: '',
                fileName: '',
                type: '',
                status: 'Soạn thảo',
                category: '',
                projectName: '',
                description: '',
                duration: '',
                fileFormat: '',
                assignedTo: '',
                filePath: '',
                image: undefined,
                isEdit,
            },
    })

    const imageValue = form.watch('image')

    // Handle image preview
    useEffect(() => {
        if (imageValue instanceof File) {
            const imageUrl = URL.createObjectURL(imageValue)
            setImagePreview(imageUrl)
            return () => URL.revokeObjectURL(imageUrl)
        } else if (typeof imageValue === 'string' && imageValue) {
            setImagePreview(imageValue)
        } else {
            setImagePreview(null)
        }
    }, [imageValue])

    // Set initial preview for edit mode
    useEffect(() => {
        if (isEdit && currentRow && isImageAsset) {
            const initialImage = currentRow.thumbnail || currentRow.filePath
            if (initialImage) {
                setImagePreview(initialImage)
            }
        }
    }, [isEdit, currentRow, isImageAsset])

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        
        if (!file) {
            form.setValue('image', isEdit ? currentRow?.thumbnail || currentRow?.filePath || '' : undefined)
            return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh')
            event.target.value = ''
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB')
            event.target.value = ''
            return
        }

        form.setValue('image', file)
        
        // Auto-fill fileName if empty and not in edit mode
        if (!isEdit && !form.getValues('fileName')) {
            form.setValue('fileName', file.name)
        }
    }

    const handleRemoveImage = () => {
        form.setValue('image', undefined)
        setImagePreview(null)
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }
    }

    const onSubmit = (values: AssetForm) => {
        // Handle file upload logic here
        if (values.image instanceof File) {
            // In a real app, you would upload the file to your server
            console.log('Uploading file:', values.image)
        }
        
        form.reset()
        showSubmittedData(values)
        onOpenChange(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(state) => {
                form.reset()
                setImagePreview(null)
                onOpenChange(state)
            }}
        >
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader className='text-start'>
                    <DialogTitle>{isEdit ? 'Chỉnh sửa thiết kế' : 'Thêm thiết kế mới'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Cập nhật thông tin thiết kế tại đây. ' : 'Tạo thiết kế mới tại đây. '}
                        Nhấn lưu khi hoàn tất.
                    </DialogDescription>
                </DialogHeader>
                <div className='h-[28rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
                    <Form {...form}>
                        <form
                            id='asset-form'
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='space-y-4 px-0.5'
                        >
                            {/* Image Upload Section */}
                            <FormField
                                control={form.control}
                                name='image'
                                render={() => (
                                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-2'>
                                        <FormLabel className='col-span-2 text-end pt-2'>
                                            Hình ảnh
                                        </FormLabel>
                                        <div className='col-span-4 space-y-2'>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="cursor-pointer"
                                                />
                                            </FormControl>
                                            {imagePreview && (
                                                <AssetImagePreview
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    onRemove={handleRemoveImage}
                                                    className="mt-2"
                                                />
                                            )}
                                        </div>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Tên thiết kế
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Nhập tên thiết kế'
                                                className='col-span-4'
                                                autoComplete='off'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='fileName'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Tên file
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='example.jpg'
                                                className='col-span-4'
                                                autoComplete='off'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='type'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Loại</FormLabel>
                                        <SelectDropdown
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Chọn loại thiết kế'
                                            className='col-span-4'
                                            items={assetTypes?.map(({ label, value }) => ({
                                                label,
                                                value,
                                            })) || []}
                                        />
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='status'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Trạng thái
                                        </FormLabel>
                                        <SelectDropdown
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Chọn trạng thái'
                                            className='col-span-4'
                                            items={assetStatuses?.map(({ label, value }) => ({
                                                label,
                                                value,
                                            })) || []}
                                        />
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='category'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Chuyên mục
                                        </FormLabel>
                                        <SelectDropdown
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Chọn chuyên mục'
                                            className='col-span-4'
                                            items={assetCategories?.map(({ label, value }) => ({
                                                label,
                                                value,
                                            })) || []}
                                        />
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='projectName'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Dự án
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Nhập tên dự án'
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='description'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Mô tả
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Nhập mô tả thiết kế'
                                                className='col-span-4 min-h-[60px]'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='fileFormat'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Định dạng
                                        </FormLabel>
                                        <SelectDropdown
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Chọn định dạng file'
                                            className='col-span-4'
                                            items={fileFormats?.map(({ label, value }) => ({
                                                label,
                                                value,
                                            })) || []}
                                        />
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='duration'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Thời lượng
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='10-20 khung hình'
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <DialogFooter>
                    <Button type='submit' form='asset-form'>
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
