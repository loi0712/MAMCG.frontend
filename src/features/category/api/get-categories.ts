import { apiUrls } from '@/api/config/endpoints';
import { axios } from '@/shared/lib/axios';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Category } from '../data/categories';

// ===========================================
// TYPES
// ===========================================

export interface CategoriesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface TCategoriesResponse {
  data: Category[];
  totalCount: number;
}

export interface CategoriesQueryContext {
  queryKey: [string, CategoriesQueryParams];
  signal?: AbortSignal;
}

export interface CategoryGroup {
    id: number;
    name: string;
}

export interface CategoryDetailsResponse {
    category: Category | null;
    categoryGroups: CategoryGroup[];
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getCategories = async ({ queryKey }: CategoriesQueryContext): Promise<TCategoriesResponse> => {
  const [, params] = queryKey;

  const response = await axios.get<TCategoriesResponse>(apiUrls.category.list, {
    params: {
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 10,
      searchTerm: params.searchTerm ?? '',
    },
  });

  return response.data;
};

export const getCategoryGroups = async (id: number): Promise<CategoryDetailsResponse> => {
    const response = await axios.get<CategoryDetailsResponse>(apiUrls.category.details(id));
    return response.data;
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useCategoriesPaginated = ({
  pageNumber,
  pageSize,
  searchTerm,
}: CategoriesQueryParams = {}) =>
  useQuery({
    queryKey: ['categories', { pageNumber, pageSize, searchTerm }],
    queryFn: getCategories,
    placeholderData: keepPreviousData,
  });

export const useCategoryGroups = () =>
    useQuery({
        queryKey: ['category-groups'],
        queryFn: () => getCategoryGroups(0),
    });
