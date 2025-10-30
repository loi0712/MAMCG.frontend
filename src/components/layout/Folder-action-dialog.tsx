'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { Checkbox } from '../ui/checkbox'
import FilterBuilder, {
  type FilterItem,
  type FilterQuery,
  type ColumnWithDataSource,
  getFilterableColumns,

} from '@/components/ui/filter'
import { TCreateFolder } from '@/components/layout/types/index'
import { useCallback, useMemo, useEffect, useRef, memo } from 'react'
import { useCreateNewFolder } from '@/components/layout/api/create-folder'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { urls } from '@/routes/urls'
import {
  type FolderFilter,
  type Field,
  type ParentFolder,
  useFolderDetailsRaw
} from './api/get-folder-details'
import { useUpdateFolder } from './api/update-folder'
import { useCategoryGroups } from '@/features/category/api/get-categories'
import { generateCategoryCode } from '@/lib/utils'

// ==================== CONSTANTS ====================

const FILTER_OPERATORS = [
  { value: 'EQUALS', label: 'Bằng' },
  { value: 'NOT_EQUALS', label: 'Không bằng' },
  { value: 'CONTAINS', label: 'Chứa' },
  { value: 'NOT_CONTAINS', label: 'Không chứa' },
  { value: 'STARTS_WITH', label: 'Bắt đầu bằng' },
  { value: 'ENDS_WITH', label: 'Kết thúc bằng' },
  { value: 'GREATER_THAN', label: 'Lớn hơn' },
  { value: 'LESS_THAN', label: 'Nhỏ hơn' },
  { value: 'GREATER_THAN_OR_EQUAL', label: 'Lớn hơn hoặc bằng' },
  { value: 'LESS_THAN_OR_EQUAL', label: 'Nhỏ hơn hoặc bằng' },
]

// ==================== ZOD SCHEMAS ====================

const formFilterSchema = z.object({
  logicalOperator: z.enum(['AND', 'OR']),
  fieldId: z.number(), // ✅ Actual field ID (number)
  fieldName: z.string().min(1, 'Tên trường không được để trống.'),
  operator: z.string().min(1, 'Toán tử không được để trống.'),
  value: z.string().min(1, 'Giá trị lọc không được để trống.'),
});

const folderSchema = z
  .object({
    id: z.number().nullable(),
    name: z.string().min(1, 'Tên thư mục là bắt buộc.'),
    description: z.string().optional(),
    parentId: z.number().nullable(),
    parentName: z.string().nullable(),
    index: z.number().int().min(0).max(2147483647),
    isEdit: z.boolean(),
    isSmartFolder: z.boolean(),
    isCreateCategory: z.boolean(),
    categoryGroupId: z.string().nullable(),
    categoryCode: z.string().optional(),
    filters: z.array(formFilterSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isSmartFolder) {
      if (!data.filters || data.filters.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Thư mục thông minh cần ít nhất một điều kiện lọc.',
          path: ['filters'],
        });
      }
    }
  });

type FolderForm = z.infer<typeof folderSchema>
type FormFilter = z.infer<typeof formFilterSchema>

// ==================== INTERFACES ====================

export interface Folder {
  id: number | null
  name: string
  description?: string
  parentId?: number | null
  parentName: string | null
  index: number
  isSmartFolder: boolean
  isCreateCategory: boolean
  categoryGroupId: string | null
  categoryCode: string | null
  filters: FolderFilter[] | []
}

type FolderActionDialogProps = {
  currentRow?: Folder
  open: boolean
  onOpenChange: (open: boolean) => void
  isEdit: boolean
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Transform API filters to FilterBuilder format
 * API format: { field: { id: number, name: string }, ... }
 * FilterBuilder format: { columnId: string, fieldId: number, fieldName: string, ... }
 */
const transformApiFiltersToFilterItems = (
  apiFilters: FolderFilter[],
  fields: Field[]
): FilterItem[] => {
  return apiFilters
    .map((filter, index) => {
      const field = fields.find(f => f.id === filter.field.id)
      if (!field) return null

      return {
        columnId: `col-init-${filter.field.id}-${index}`, // ✅ Unique React key
        logicalOperator: filter.logicalGroup as 'AND' | 'OR',
        fieldId: filter.field.id,      // ✅ Actual field ID (number)
        fieldName: field.fieldName,    // ✅ Field name for display
        operator: filter.operator,
        value: filter.value,
      }
    })
    .filter(Boolean) as FilterItem[]
}

/**
 * Transform FilterBuilder items to form format
 */
const transformFilterItemsToFormFilters = (filterItems: FilterItem[]) => {
  console.log('🔄 [TRANSFORM] Input filterItems:', filterItems);

  const result = filterItems.map(item => ({
    // Map to your form's expected structure
    fieldId: item.fieldId,
    fieldName: item.fieldName,
    operator: item.operator,
    value: item.value,
    logicalOperator: item.logicalOperator,
  }));

  console.log('🔄 [TRANSFORM] Output formFilters:', result);
  return result;
};

/**
 * Transform form filters to API format
 * Form format: { fieldId: number, fieldName: string, ... }
 * API format: { fieldId: number, operator, value, logicalGroup, sortOrder }
 */
const transformFormFiltersToApiFilters = (
  formFilters: FormFilter[]
) => {
  return formFilters.map((filter, index) => ({
    fieldId: filter.fieldId,         // ✅ Already a number
    operator: filter.operator,
    value: filter.value,
    logicalGroup: filter.logicalOperator,
    sortOrder: index,
  }))
}

/**
 * Get flat folders with hierarchical names for dropdown
 */
const getFlatFoldersWithHierarchicalNames = (parentFolders: ParentFolder[]): any => {
  const result: any[] = []

  const flatten = (nodes: ParentFolder[], parentPath: string = '') => {
    for (const node of nodes) {
      const level = 1
      const displayName = level === 1
        ? node.name
        : `${parentPath}/${node.name}`

      result.push({
        value: node.id.toString(),
        label: displayName
      })
    }
  }

  flatten(parentFolders)
  return result
}

// ==================== LOADING COMPONENT ====================

const LoadingDialog = memo<Pick<FolderActionDialogProps, 'open' | 'onOpenChange'>>(
  ({ open, onOpenChange }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Đang tải...</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        </div>
      </DialogContent>
    </Dialog>
  )
)

LoadingDialog.displayName = 'LoadingDialog'

// ==================== MAIN COMPONENT ====================

export const FoldersActionDialog = memo<FolderActionDialogProps>(
  function FoldersActionDialog({
    currentRow,
    open,
    onOpenChange,
    isEdit
  }) {
    const navigate = useNavigate()
    const createFolderMutation = useCreateNewFolder()
    const updateFolderMutation = useUpdateFolder()
    const queryClient = useQueryClient()

    const { data: folderDetailsData, isLoading } = useFolderDetailsRaw('0', true)

    const prevOpenRef = useRef(open)
    const prevCurrentRowIdRef = useRef(currentRow?.id)

    const filterColumns = useMemo<ColumnWithDataSource[]>(() => {
      if (!folderDetailsData?.fields) return []
      return getFilterableColumns(folderDetailsData.fields, ['image'])
    }, [folderDetailsData?.fields])

    const parentFolderOptions = useMemo(() => {
      if (!folderDetailsData?.parentFolders) return [];
      return getFlatFoldersWithHierarchicalNames(folderDetailsData.parentFolders);
    }, [folderDetailsData?.parentFolders])

    const initialFilterItems = useMemo(() => {
      if (!currentRow?.filters?.length || !folderDetailsData?.fields) return []
      return transformApiFiltersToFilterItems(currentRow.filters, folderDetailsData.fields)
    }, [currentRow?.filters, folderDetailsData?.fields])

    const defaultValues = useMemo<FolderForm>(() => {
      const formFilters = isEdit && initialFilterItems.length > 0
        ? transformFilterItemsToFormFilters(initialFilterItems)
        : []

      return {
        id: isEdit ? (currentRow?.id ?? null) : null,
        name: isEdit ? (currentRow?.name ?? '') : '',
        description: isEdit ? (currentRow?.description ?? '') : '',
        parentId: isEdit ? (currentRow?.parentId ?? null) : currentRow ? currentRow.id : null,
        parentName: isEdit ? (currentRow?.parentName ?? '') : '',
        index: isEdit ? (currentRow?.index ?? 0) : 0,
        isSmartFolder: currentRow?.isSmartFolder ?? false,
        isCreateCategory: currentRow?.isCreateCategory ?? false,
        categoryGroupId: currentRow?.categoryGroupId ?? null,
        categoryCode: currentRow?.categoryCode ?? '',
        filters: formFilters,
        isEdit,
      } satisfies FolderForm
    }, [currentRow, isEdit, initialFilterItems])

    const form = useForm<FolderForm>({
      resolver: zodResolver(folderSchema),
      defaultValues,
      mode: 'onChange',
    })

    const { data: categoryGroupsData, isLoading: isLoadingCategoryGroups } = useCategoryGroups();

    const categoryGroupItems = categoryGroupsData?.categoryGroups.map(group => ({
      label: group.name,
      value: String(group.id),
    }));

    const watchName = form.watch('name');
    const watchIsCreateCategory = form.watch('isCreateCategory');

    useEffect(() => {
      const generatedCode = generateCategoryCode(watchName);
      if (generatedCode && watchIsCreateCategory) {
        form.setValue('categoryCode', generatedCode, {
          shouldValidate: false,
          shouldDirty: true
        });
      }
    }, [watchName, form, watchIsCreateCategory]);

    useEffect(() => {
      const didOpen = !prevOpenRef.current && open
      const rowChanged = prevCurrentRowIdRef.current !== currentRow?.id

      if (didOpen || (open && rowChanged)) {
        setTimeout(() => {
          form.reset(defaultValues)
        }, 0)
      }

      prevOpenRef.current = open
      prevCurrentRowIdRef.current = currentRow?.id
    }, [open, currentRow?.id, defaultValues, form])

    const watchedIsSmartFolder = form.watch('isSmartFolder')
    const watchedIsCreateCategory = form.watch('isCreateCategory')


    const convertToApiFormat = useCallback((values: FolderForm): TCreateFolder => {
      const apiFilters = values.filters
        ? transformFormFiltersToApiFilters(values.filters)
        : []

      return {
        id: values.id,
        name: values.name,
        description: values.description ?? null,
        index: values.index,
        parentId: values.parentId,
        parentName: values.parentName,
        folderStyle: 'Default',
        projectCode: '',
        filters: apiFilters,
      }
    }, [])

    const onSubmit = useCallback(async (values: FolderForm) => {
      console.log('📤 Submitting folder:', values);

      try {
        // ✅ Double-check validation for smart folder
        if (values.isSmartFolder && (!values.filters || values.filters.length === 0)) {
          form.setError('filters', {
            type: 'manual',
            message: 'Thư mục thông minh cần ít nhất một điều kiện lọc.',
          });
          console.error('❌ Validation failed: No filters for smart folder');
          return;
        }

        console.log('📤 Submitting folder:', values);
        const apiData = convertToApiFormat(values);
        console.log('📤 API data:', apiData);

        if (isEdit) {
          const updatedFolder = await updateFolderMutation.mutateAsync({
            id: apiData.id!.toString(),
            folderDetails: apiData,
          });
          if (updatedFolder) {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['assets'] }),
              queryClient.invalidateQueries({ queryKey: ['folder-details-raw'] }),
              queryClient.invalidateQueries({ queryKey: ['folders'] }),
            ]);
            navigate({
              to: urls.assets,
              search: {
                folderId: values.id?.toString(),
                page: 1,
                pageSize: 10,
              },
            });
          }
        } else {
          const newFolder = await createFolderMutation.mutateAsync(apiData);
          if (newFolder?.id) {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['assets'] }),
              queryClient.invalidateQueries({ queryKey: ['folder-details-raw'] }),
            ]);
            navigate({
              to: urls.assets,
              search: {
                folderId: newFolder.id.toString(),
                page: 1,
                pageSize: 10,
              },
            });
          }
        }

        form.reset();
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to', isEdit ? 'update' : 'create', 'folder:', error);
      }
    }, [
      convertToApiFormat,
      isEdit,
      updateFolderMutation,
      createFolderMutation,
      form,
      navigate,
      onOpenChange,
      queryClient,
    ]);

    const handleParentFolderChange = useCallback((value: string) => {
      const selectedParentId = parseInt(value, 10)
      const selectedFolder = parentFolderOptions.find((folder: any) => folder.value === value)

      form.setValue('parentId', selectedParentId, { shouldValidate: true })
      form.setValue('parentName', selectedFolder?.label || '', { shouldValidate: true })
    }, [form, parentFolderOptions])

    const handleSmartFolderChange = useCallback((checked: boolean) => {
      form.setValue('isSmartFolder', checked, { shouldValidate: true })

      if (!checked) {
        form.setValue('filters', [], { shouldValidate: true })
      }
    }, [form])

    const handleCreateCategoryChange = useCallback((checked: boolean) => {
      form.setValue('isCreateCategory', checked, { shouldValidate: true })

      if (!checked) {
        form.setValue('categoryCode', '', { shouldValidate: true })
        form.setValue('categoryGroupId', null, { shouldValidate: true })

      }
    }, [form])

    const handleFiltersChange = useCallback(async (filterQuery: FilterQuery) => {
      const formFilters = filterQuery.filters.map(filter => {
        const column = filterColumns.find(col => col.id === filter.fieldId)
        return {
          fieldId: filter.fieldId,
          fieldName: column?.value || '',
          operator: filter.operator,
          value: filter.value,
          logicalOperator: filter.logicalGroup as 'AND' | 'OR',
        }
      })

      form.setValue('filters', formFilters, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    }, [form, filterColumns]);

    const handleDialogClose = useCallback((state: boolean) => {
      if (!state) {
        form.reset()
      }
      onOpenChange(state)
    }, [form, onOpenChange])

    const dialogTitle = isEdit ? 'Chỉnh sửa thư mục' : 'Thêm thư mục mới'
    const dialogDescription = isEdit
      ? 'Cập nhật thông tin thư mục tại đây. Nhấn lưu khi hoàn tất.'
      : 'Tạo thư mục mới tại đây. Nhấn lưu khi hoàn tất.'

    const isSubmitting = createFolderMutation.isPending || updateFolderMutation.isPending

    if (isLoading && open) {
      return <LoadingDialog open={open} onOpenChange={handleDialogClose} />
    }

    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className='sm:max-w-4xl max-h-[90vh]'>
          <DialogHeader className='text-start'>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <div className='max-h-[70vh] overflow-y-auto py-1 pe-3'>
            <Form {...form}>
              <form
                id='folder-form'
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4 px-0.5'
              >
                <FormField
                  control={form.control}
                  name='parentId'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Thư mục cha
                      </FormLabel>
                      <SelectDropdown
                        defaultValue={field.value?.toString()}
                        onValueChange={handleParentFolderChange}
                        placeholder='Chọn thư mục cha'
                        className='col-span-4 w-full'
                        items={parentFolderOptions}
                        isControlled={true}
                      />
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Tên thư mục
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Nhập tên thư mục'
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
                  name='isCreateCategory'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Tạo chuyên mục
                      </FormLabel>
                      <div className='col-span-4 flex items-center space-x-2'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={handleCreateCategoryChange}
                          />
                        </FormControl>
                        <FormDescription className='text-sm text-muted-foreground'>
                          Tự động tạo chuyên mục có cùng tên
                        </FormDescription>
                      </div>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />

                {watchedIsCreateCategory && (
                  <div className='border border-border rounded-lg p-4 bg-card min-w-[800px] shadow-sm  space-y-4'>
                    <FormField
                      control={form.control}
                      name="categoryGroupId"
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                          {/* <div className='col-span-2 text-end'></div> */}
                          {/* <div className='col-span-4 w-full grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'> */}
                            <FormLabel className='col-span-2 text-end'>Nhóm chuyên mục</FormLabel>
                            <SelectDropdown
                              onValueChange={field.onChange}
                              defaultValue={field.value ? String(field.value) : ''}
                              placeholder="Chọn nhóm chuyên mục"
                              isPending={isLoadingCategoryGroups}
                              items={categoryGroupItems}
                              className={'col-span-4 w-full'}
                            />
                            <FormMessage />
                          {/* </div> */}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryCode"
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                          {/* <div className='col-span-2 text-end'></div> */}
                          {/* <div className='col-span-4 w-full grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'> */}
                            <FormLabel className='col-span-2 text-end'>Mã chuyên mục</FormLabel>
                            <FormControl className='col-span-4'>
                              <Input
                                placeholder="Tự động tạo từ tên chuyên mục"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          {/* </div> */}
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Mô tả
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            watchedIsSmartFolder
                              ? 'Mô tả tiêu chí tự động sắp xếp'
                              : 'Nhập mô tả thư mục'
                          }
                          className='col-span-4 min-h-[80px] resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isSmartFolder'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Thư mục thông minh
                      </FormLabel>
                      <div className='col-span-4 flex items-center space-x-2'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={handleSmartFolderChange}
                          />
                        </FormControl>
                        <FormDescription className='text-sm text-muted-foreground'>
                          Tự động lọc nội dung theo tiêu chí
                        </FormDescription>
                      </div>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />

                {watchedIsSmartFolder && (
                  <FormField
                    control={form.control}
                    name="filters"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <FilterBuilder
                            columns={filterColumns}
                            operators={FILTER_OPERATORS}
                            onFiltersApply={handleFiltersChange}
                            initialFilters={initialFilterItems}
                            autoApply={true}
                            isSearch={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </form>
            </Form>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => handleDialogClose(false)}
              type="button"
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type='submit'
              form='folder-form'
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

FoldersActionDialog.displayName = 'FoldersActionDialog'