import type { AxiosError } from "axios";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiUrls } from "@/api/config/endpoints";
import { axios } from "@/shared/lib/axios";
import { handleApiError } from "@/utils/error-handler";
import { toast } from "sonner";

interface ApiErrorResponse {
  error: string;
  message?: string;
}

export type DeleteFolderDetailsDTO = {
  id: string;
};

export const deleteFolder = async ({ id }: DeleteFolderDetailsDTO) => {
  const result = await axios.delete(apiUrls.folder.delete(id));

  return result.data;
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteFolder,
    onError: (error: AxiosError<ApiErrorResponse>) => {
      handleApiError(error, "Lỗi xoá thư mục! Vui lòng thử lại.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('Xoá thư mục thành công')
    },
  });
};
