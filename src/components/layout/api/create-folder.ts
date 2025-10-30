import type { TCreateFolder } from '@/components/layout/types/index';
import { cleanObject, type CustomObject } from '@/utils/clean-object';
import { AxiosError } from 'axios';
import { axios } from '@/shared/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiUrls } from '@/api/config/endpoints';
import { handleApiError } from '@/utils/error-handler';
import { toast } from 'sonner';

interface ApiErrorResponse {
  error: string;
  message?: string;
}

export const createNewFolder = async (data: TCreateFolder) => {
  const _data = cleanObject(data as unknown as CustomObject);
  const result = await axios.post(apiUrls.folder.create, _data);

  return result.data;
};

export const useCreateNewFolder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createNewFolder,
    onError: (error: AxiosError<ApiErrorResponse>) => {
      handleApiError(error, 'Create Folder');
      toast.error(`Lỗi: ${error.message}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('Tạo thư mục thành công')
    },
  });
};
