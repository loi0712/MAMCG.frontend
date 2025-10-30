import type { CustomObject } from '@/utils/clean-object';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { cleanObject } from '@/utils/clean-object';
import { TCreateFolder } from '../types/folders';
import { handleApiError } from '@/utils/error-handler';

interface ApiErrorResponse {
  error: string;
  message?: string;
}

export type UpdateFolderDetailsDTO = {
  folderDetails: TCreateFolder;
  id: string;
};

export const updateFolder = async ({ id, folderDetails }: UpdateFolderDetailsDTO) => {
  const data = cleanObject(folderDetails as unknown as CustomObject);

  const result = await axios.put(apiUrls.folder.update(id), data);

  return result.data;
};

export const useUpdateFolder = () => {
  return useMutation({
    mutationFn: updateFolder,
    onError: (error:  AxiosError<ApiErrorResponse>) => {
      handleApiError(error, 'Update Folder');
    },
  });
};
