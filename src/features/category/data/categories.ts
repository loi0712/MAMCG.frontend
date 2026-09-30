// ===========================================
// CATEGORY TYPES
// ===========================================

export interface Category {
  id: number;
  name: string;
  description: string | null;
  groupId: number;
  code: string;
  groupName?: string | null;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface CategoriesApiResponse {
  categories: Category[];
  totalCount: number;
}

export interface CategoryDetailsResponse {
  category: Category;
}
