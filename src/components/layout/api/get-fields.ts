import {
    GetFieldsProps,
    TFieldsResponse,
    type TQueryFieldsKeys,
} from '@/components/layout/types/index'

import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { useQuery } from '@tanstack/react-query'

export const getFields = async ({ queryKey }: GetFieldsProps) => {
    const [
        ,
        {
            pageNumber,
            pageSize,
            searchTerm,
            includeSystemField
        },
    ] = queryKey;

    const response = await axios.get<TFieldsResponse>(apiUrls.field.list, {
        params: {
            pageNumber,
            pageSize,
            searchTerm,
            includeSystemField
        }
    });

    return response.data.fields;
}

export const useFields = ({
            pageNumber,
            pageSize,
            searchTerm,
            includeSystemField
}: TQueryFieldsKeys) =>
    useQuery({
        queryKey: [
            'folders',
            {
            pageNumber,
            pageSize,
            searchTerm,
            includeSystemField
            },
        ],
        queryFn: getFields,
    });