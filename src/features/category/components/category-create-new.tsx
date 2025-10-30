'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useCreateCategory } from '../api/create';
import { useCategoryGroups } from '../api/get-categories';
import { SelectDropdown } from '@/components/select-dropdown';
import { useEffect } from 'react';
import { generateCategoryCode } from '@/lib/utils';

// ===========================================
// SCHEMA
// ===========================================

const createCategorySchema = z.object({
  name: z.string().min(1, 'Tên chuyên mục là bắt buộc.'),
  description: z.string().optional(),
  groupId: z.coerce.number().min(1, 'Vui lòng chọn một nhóm chuyên mục.'),
  code: z.string().min(1, 'Mã chuyên mục là bắt buộc.'),
});

// Separate input and output types
type CreateCategoryInput = z.input<typeof createCategorySchema>;
type CreateCategoryOutput = z.output<typeof createCategorySchema>;

// ===========================================
// PROPS
// ===========================================

type CategoryCreateNewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: () => void;
};

// ===========================================
// MAIN COMPONENT
// ===========================================

export function CategoryCreateNewDialog({
  open,
  onOpenChange,
  onCategoryCreated,
}: CategoryCreateNewDialogProps) {
  const createCategoryMutation = useCreateCategory();
  const { data: categoryGroupsData, isLoading: isLoadingCategoryGroups } = useCategoryGroups();

  const form = useForm<CreateCategoryInput, unknown, CreateCategoryOutput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      groupId: '',
      code: '',
    },
  });

  // Watch field "name" để tự động tạo code
  const watchName = form.watch('name');

  // Tự động cập nhật code khi name thay đổi
  useEffect(() => {
    const generatedCode = generateCategoryCode(watchName);
    if (generatedCode) {
      form.setValue('code', generatedCode, {
        shouldValidate: false,
        shouldDirty: true
      });
    }
  }, [watchName, form]);

  const handleFormSubmit = async (values: CreateCategoryOutput) => {
    try {
      // Ensure description is always a string for the API
      const payload = {
        ...values,
        description: values.description ?? '',
      };
      await createCategoryMutation.mutateAsync(payload);
      onCategoryCreated?.();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenChange = (state: boolean) => {
    if (!createCategoryMutation.isPending) {
      onOpenChange(state);
      if (!state) {
        form.reset();
      }
    }
  };

  const categoryGroupItems = categoryGroupsData?.categoryGroups.map(group => ({
    label: group.name,
    value: String(group.id),
  }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tạo chuyên mục mới</DialogTitle>
          <DialogDescription>
            Tạo chuyên mục mới tại đây. Nhấn tạo chuyên mục khi hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-category-form"
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className='flex'>
                  <FormLabel className='w-2/5'>Tên chuyên mục</FormLabel>
                  <FormControl className='w-3/5'>
                    <Input placeholder="Nhập tên chuyên mục" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem className='flex'>
                  <FormLabel className='w-2/5'>Nhóm chuyên mục</FormLabel>
                  <SelectDropdown
                    onValueChange={field.onChange}
                    defaultValue={field.value ? String(field.value) : ''}
                    placeholder="Chọn nhóm chuyên mục"
                    isPending={isLoadingCategoryGroups}
                    items={categoryGroupItems}
                    className={'w-3/5'}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className='flex'>
                  <FormLabel className='w-2/5'>Mã chuyên mục</FormLabel>
                  <FormControl className='w-3/5'>
                    <Input
                      placeholder="Tự động tạo từ tên chuyên mục"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className='flex'>
                  <FormLabel className='w-2/5'>Mô tả (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      className='w-3/5'
                      placeholder="Nhập mô tả"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="submit"
            form="create-category-form"
            disabled={createCategoryMutation.isPending}
          >
            {createCategoryMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {createCategoryMutation.isPending ? 'Đang tạo...' : 'Tạo chuyên mục'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
