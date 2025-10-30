import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

// ===========================================
// TYPES
// ===========================================

export interface PreviewCgRequest {
    sceneName: string;
    scenePath: string;
    previewPath: string;
    variables: {
        [key: string]: string;
    };
    previewType: string;
}

export interface PreviewCgResponse {
    message: string;
    success: boolean;
    previewPath: string;
}

// ===========================================
// API FUNCTIONS
// ===========================================

/**
 * Preview CG Scene
 * POST /CGCommand/PreviewCGScene
 */
export const previewCg = async (data: PreviewCgRequest): Promise<PreviewCgResponse> => {
    const response = await axios.post<PreviewCgResponse>(apiUrls.cg.preview, data);
    return response.data;
};

// ===========================================
// CUSTOM HOOKS
// ===========================================

/**
 * Mutation hook for previewing CG
 */
export const usePreviewCg = () => {
    return useMutation({
        mutationKey: ['preview-cg'],
        mutationFn: previewCg,
        onSuccess: (data) => {
            if (data?.success === false) {
                toast.error(data.message || 'Có lỗi xảy ra khi preview CG');
                return;
            }
            toast.success('Xem trước CG thành công!');
        },
        onError: (error: unknown) => {
            if (isAxiosError(error)) {
                console.error('Error previewing CG:', {
                    status: error.response?.status,
                    message: error.message,
                });
            } else {
                console.error('Error previewing CG:', error);
            }
            toast.error('Không xem trước được CG. Vui lòng thử lại.');
        },
    });
};
