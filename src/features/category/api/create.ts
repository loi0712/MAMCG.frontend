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
      toast.success('Tạo chuyên mục thành công!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-group-list'] });
    },
    // Lỗi (vd. trùng mã → 409) do onError mặc định của QueryClient thông báo
  });
};
