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

export type DeleteAssetDetailsDTO = {
    id: number;
};

export const deleteAsset = async ({ id }: DeleteAssetDetailsDTO) => {
    const result = await axios.delete(apiUrls.asset.delete(id.toString()));

    return result.data;
};

export const useDeleteAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAsset,
        onError: (error: AxiosError<ApiErrorResponse>) => {
            handleApiError(error, "Delete Asset");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            toast.success('Xóa thiết kế thành công');
        },
    });
};
