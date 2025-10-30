import {
    type TFoldersResponse,
    type GetFoldersProps,
    type TQueryKeys
} from '@/components/layout/types/index'

import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { useQuery } from '@tanstack/react-query'

export const getFolders = async ({ queryKey }: GetFoldersProps) => {
    const [
        ,
        {
            parentId,
            isGetAll
        },
    ] = queryKey;

    const response = await axios.get<TFoldersResponse>(apiUrls.folder.list, {
        params: {
            parentId,
            isGetAll
        }
    });

    return response.data;
}

export const useFolders = ({
    parentId,
    isGetAll
}: TQueryKeys) =>
    useQuery({
        queryKey: [
            'folders',
            {
                parentId,
                isGetAll
            },
        ],
        queryFn: getFolders,
    });