import { apiUrls } from '@/api/config/endpoints';
import { axios } from '@/shared/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ===========================================
// TYPES
// ===========================================

export interface CreateCategoryRequest {
  name: string;
  description: string;
  groupId: number;
  code: string;
}

export interface CreateCategoryResponse {
  id: number;
  message: string;
  success: boolean;
}

// ===========================================
// API FUNCTIONS
// ===========================================

/**
 * Create new category
 * POST /api/Category/create
 */
export const createCategory = async (data: CreateCategoryRequest): Promise<CreateCategoryResponse> => {
  const response = await axios.post<CreateCategoryResponse>(apiUrls.category.create, data);
  return response.data;
};

// ===========================================
// CUSTOM HOOKS
// ===========================================

/**
 * Mutation hook for creating categories
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Tạo danh mục thành công!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      console.error('Error creating category:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    },
  });
};
