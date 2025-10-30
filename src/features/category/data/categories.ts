// ===========================================
// CATEGORY TYPES
// ===========================================

export interface Category {
  id: number;
  name: string;
  description: string;
  groupId: number;
  code: string;
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
