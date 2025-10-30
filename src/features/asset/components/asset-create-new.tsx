'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Resolver, useForm, useFormContext } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import {
    DynamicField,
    getFieldKey,
    getSelectItems,
    transformFormValues,
    useDynamicFieldsForCreateForm,
    useCreateAsset
} from '../api/create'
import { toast } from 'sonner'
import { DynamicForm as DynamicFormArray } from '@/components/dynamic-form'
import { FileUploadSection } from '@/components/file-upload-section'


// ===========================================
// TYPES
// ===========================================

interface FormItem {
    title: string;
    content: string;
}

type FormValues = Record<string, string | FormItem[]> & {
    files?: File[];
}

type AssetsActionDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAssetCreated?: () => void
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Create dynamic Zod schema from fields
 */
function createDynamicSchema(fields: DynamicField[]) {
    const schemaShape: Record<string, z.ZodTypeAny> = {}

    fields.forEach((field) => {
        const fieldKey = getFieldKey(field.id)

        switch (field.dataType.name) {
            case 'singleline':
                schemaShape[fieldKey] = z.string().min(1, `${field.displayName} là bắt buộc`)
                break

            case 'multiline':
                schemaShape[fieldKey] = z.string().optional()
                break

            case 'table':
                schemaShape[fieldKey] = z.array(
                    z.object({
                        title: z.string().min(1, 'Tiêu đề là bắt buộc'),
                        content: z.string().min(1, 'Nội dung là bắt buộc'),
                    })
                ).min(1, 'Ít nhất một mục là bắt buộc')
                break

            case 'category':
            case 'project':
            case 'assettype':
                schemaShape[fieldKey] = z.string().min(1, `${field.displayName} là bắt buộc`)
                break

            default:
                schemaShape[fieldKey] = z.string().optional()
        }
    })

    // Add files schema - optional array of File objects
    schemaShape.files = z.array(z.instanceof(File)).optional()

    return z.object(schemaShape)
}

/**
 * Generate default form values from fields
 */
function generateDefaultValues(fields: DynamicField[]): FormValues {
    const values: Record<string, any> = {}

    fields.forEach((field) => {
        const fieldKey = getFieldKey(field.id)

        if (field.dataType.name === 'table') {
            values[fieldKey] = [{ title: 'Thời lượng', content: '' }]
        } else {
            values[fieldKey] = ''
        }
    })

    values.files = []

    return values
}



// ===========================================
// SUB-COMPONENTS
// ===========================================

/**
 * Dynamic field renderer component
 */
function DynamicFieldRenderer({
    field,
    control,
}: {
    field: DynamicField;
    control: any;
}) {
    const { watch, setValue } = useFormContext<FormValues>(); // Use useFormContext to access form methods
    const selectedFiles = watch('files') || [];
    const onFilesChange = (files: File[]) => setValue('files', files);

    const fieldKey = getFieldKey(field.id)
    const categoryGroupFieldKey = 'field_10'; // The key for CategoryGroup field (id: 10)
    const selectedCategoryGroupId = watch(categoryGroupFieldKey);

    // Always call useEffect at the top level - handle Category reset when CategoryGroup changes
    useEffect(() => {
        if (field.fieldName === 'Category') {
            const subscription = watch((value, { name }) => {
                if (name === categoryGroupFieldKey) {
                    setValue(fieldKey, ''); // Clear category selection when group changes
                }
            });
            return () => subscription.unsubscribe();
        }
    }, [field.fieldName, watch, setValue, fieldKey, categoryGroupFieldKey]);

    // Calculate selectItems based on field type
    let selectItems = getSelectItems(field.dataType.datasource);

    // Filter Category options based on selected CategoryGroup
    if (field.fieldName === 'Category') {
        if (!selectedCategoryGroupId) {
            // If no CategoryGroup is selected, show empty list
            selectItems = [];
        } else {
            // Filter categories by GroupId matching selected CategoryGroup Id
            const allCategories = getSelectItems(field.dataType.datasource);
            selectItems = allCategories.filter(
                (category: any) => {
                    try {
                        const datasource = JSON.parse(field.dataType.datasource || '[]');
                        const categoryData = datasource.find((item: any) => item.Id === category.value);
                        return categoryData?.GroupId === selectedCategoryGroupId;
                    } catch {
                        return false;
                    }
                }
            );
        }
    }

    return (
        <FormField
            control={control}
            name={fieldKey}
            render={({ field: formField }) => (
                <FormItem className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <FormLabel className='sm:w-1/5 pt-2'>
                            {field.displayName}
                        </FormLabel>

                        <div className="sm:w-4/5 w-full">
                            <FormControl>
                                {(() => {
                                    switch (field.dataType.name) {
                                        case 'singleline':
                                            return (
                                                <Input
                                                    placeholder={`Nhập ${field.displayName.toLowerCase()}`}
                                                    autoComplete='off'
                                                    className="w-full"
                                                    {...formField}
                                                    value={formField.value as string}
                                                />
                                            )

                                        case 'multiline':
                                            return (
                                                <Textarea
                                                    placeholder={`Nhập ${field.displayName.toLowerCase()}`}
                                                    className='min-h-[80px] w-full'
                                                    {...formField}
                                                    value={formField.value as string}
                                                />
                                            )

                                        case 'table':
                                            return (
                                                <div className="space-y-4">
                                                    <FileUploadSection
                                                        selectedFiles={selectedFiles}
                                                        onFilesChange={onFilesChange}
                                                    />
                                                    <DynamicFormArray
                                                        value={formField.value as FormItem[]}
                                                        onChange={formField.onChange}
                                                    />
                                                </div>
                                            )

                                        default:
                                            if (selectItems.length > 0 || field.fieldName === 'Category') {
                                                const isDisabled = field.fieldName === 'Category' && selectItems.length === 0;

                                                return (
                                                    <SelectDropdown
                                                        className='w-full'
                                                        items={selectItems}
                                                        defaultValue={formField.value}
                                                        onValueChange={formField.onChange}
                                                        placeholder={
                                                            isDisabled
                                                                ? selectedCategoryGroupId ? 'Nhóm đã chọn không chứa chuyên mục nào' :'Vui lòng chọn Nhóm chuyên mục trước'
                                                                : `Chọn ${field.displayName.toLowerCase()}`
                                                        }
                                                        disabled={isDisabled}
                                                    />
                                                );
                                            }
                                            return (
                                                <Input
                                                    placeholder={`Nhập ${field.displayName.toLowerCase()}`}
                                                    autoComplete='off'
                                                    className="w-full"
                                                    {...formField}
                                                    value={formField.value as string}
                                                />
                                            )
                                    }
                                })()}
                            </FormControl>
                            <FormMessage />
                        </div>
                    </div>
                </FormItem>
            )}
        />
    )
}

/**
 * Loading skeleton for form fields
 */
function FormFieldSkeleton() {
    return (
        <div className='space-y-2 w-full'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-10 w-full' />
        </div>
    )
}

/**
 * Loading state for entire form
 */
function FormLoadingState() {
    return (
        <div className="space-y-4">
            {[...Array(6)].map((_, index) => (
                <FormFieldSkeleton key={index} />
            ))}
        </div>
    )
}

/**
 * Empty state when no fields available
 */
function FormEmptyState() {
    return (
        <div className="text-center text-muted-foreground py-8">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
            </div>
            <p className="font-medium">Không có trường nào để hiển thị</p>
            <p className="text-sm mt-2">Vui lòng kiểm tra cấu hình form</p>
        </div>
    )
}

// ===========================================
// DYNAMIC FORM COMPONENT
// ===========================================

interface DynamicFormProps {
    fields: DynamicField[]
    onSubmit: (values: FormValues) => Promise<void>
    isSubmitting: boolean
}

function DynamicFormComponent({ fields, onSubmit, isSubmitting }: DynamicFormProps) {
    const { schema, defaultValues } = useMemo(() => {
        const validatedSchema = createDynamicSchema(fields)
        const values = generateDefaultValues(fields)

        return {
            schema: validatedSchema,
            defaultValues: values
        }
    }, [fields])

    const form = useForm<FormValues>({
        resolver: zodResolver(schema) as Resolver<FormValues>,
        defaultValues,
        mode: 'onChange',
    })

    // Reset form when fields change
    useEffect(() => {
        form.reset(defaultValues)
        form.setValue('files', []); // Clear files when form resets
    }, [defaultValues, form])

    const handleSubmit = async (values: FormValues) => {
        try {
            // The 'values' object already contains the 'files' array from react-hook-form
            console.log('Form values with files:', values)
            await onSubmit(values)
        } catch (error) {
            console.error('Error submitting form:', error)
        }
    }

    return (
        <>
            <Form {...form}>
                <form
                    id='asset-form'
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className='space-y-6 w-full'
                >
                    {fields.map((field) => (
                        <DynamicFieldRenderer
                            key={field.id}
                            field={field}
                            control={form.control}
                        />
                    ))}
                </form>
            </Form>

            <DialogFooter className="mt-6 gap-2">
                <Button
                    type='submit'
                    form='asset-form'
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Đang tạo...' : 'Tạo thiết kế'}
                </Button>
            </DialogFooter>
        </>
    )
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export function AssetsCreateNewDialog({
    open,
    onOpenChange,
    onAssetCreated,
}: AssetsActionDialogProps) {
    const {
        fields,
        isLoadingFields,
        fieldError,
        hasFields
    } = useDynamicFieldsForCreateForm({ enabled: open })

    const createAssetMutation = useCreateAsset()

    const handleFormSubmit = async (values: FormValues): Promise<void> => {
        try {
            console.log('Submitting values:', values)

            const transformedData = transformFormValues(values, fields)
            console.log('Transformed ', transformedData)

            await createAssetMutation.mutateAsync(transformedData)

            toast.success("Thiết kế đã được tạo thành công!")

            onAssetCreated?.()
            onOpenChange(false)
        } catch (error: any) {
            console.error('Submit error:', error)
            toast.error(error?.message || "Có lỗi xảy ra khi tạo thiết kế")
            throw error
        }
    }

    const handleOpenChange = (state: boolean) => {
        if (!createAssetMutation.isPending) {
            onOpenChange(state)
        }
    }

    const showForm = !isLoadingFields && !fieldError && hasFields
    const showEmpty = !isLoadingFields && !fieldError && !hasFields

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-[70%] max-h-[90vh] flex flex-col'>
                <DialogHeader className='text-start'>
                    <DialogTitle>Tạo thiết kế mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin để tạo thiết kế mới. Nhấn &quot;Tạo thiết kế&quot; khi hoàn tất.
                    </DialogDescription>
                </DialogHeader>

                <div className='flex-1 overflow-y-auto px-1 py-2'>
                    {fieldError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Không thể tải form: {fieldError.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {isLoadingFields && <FormLoadingState />}

                    {showForm && (
                        <DynamicFormComponent
                            fields={fields}
                            onSubmit={handleFormSubmit}
                            isSubmitting={createAssetMutation.isPending}
                        />
                    )}

                    {showEmpty && <FormEmptyState />}
                </div>

                {!showForm && (
                    <DialogFooter>
                        <Button
                            disabled={true}
                            className="min-w-[120px]"
                        >
                            {isLoadingFields ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tải...
                                </>
                            ) : (
                                'Tạo thiết kế'
                            )}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}
