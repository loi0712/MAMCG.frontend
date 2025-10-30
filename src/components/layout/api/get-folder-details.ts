import { apiUrls } from '@/api/config/endpoints';
import { axios } from '@/shared/lib/axios';
import { useQuery } from '@tanstack/react-query';

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface FilterField {
  id: number;
  name: string;
}

export interface FolderFilter {
  field: FilterField;
  operator: string;
  value: string;
  logicalGroup: 'AND' | 'OR';
  sortOrder: number;
}

export interface Folder {
  id: number;
  name: string;
  description: string;
  index: number;
  level: number;
  pathCode: string;
  parentId: number | null;
  parentName: string | null;
  folderStyle: string | null;
  createdAt: string;
  modifiedAt: string;
  filters: FolderFilter[];
}

export interface ParentFolder {
  id: number;
  name: string;
}

export interface FolderStyle {
  id: string;
  name: string;
}

export interface DataType {
  id: number;
  name: string;
  datasource: string | null;
}

export interface Field {
  id: number;
  fieldName: string;
  displayName: string;
  dataType: DataType;
}

export interface GetFolderDetailsResponse {
  folder: Folder;
  parentFolders: ParentFolder[];
  folderStyles: FolderStyle[];
  fields: Field[];
  operators: string[];
}

type TQueryKeys = {
  folderId: string;
};

type FolderDetailsQueryKeys = {
  queryKey: [string, TQueryKeys];
};

// ===========================================
// PARSED DATASOURCE TYPES
// ===========================================

export interface UserDataSource {
  Id: string;
  Name: string;
}

export interface CategoryDataSource {
  Id: string;
  Name: string;
  GroupId?: string;
}

export interface WorkflowStatusDataSource {
  Id: string;
  Name: string;
}

export interface AssetTypeDataSource {
  Id: string;
  Name: string;
}

// ===========================================
// TRANSFORMED DATA TYPES
// ===========================================

export interface TransformedFolderDetails {
  // Basic folder info
  id: number;
  name: string;
  description: string;
  index: number;
  level: number;
  pathCode: string;
  parentId: number | null;
  parentName: string | null;
  folderStyle: string | null;
  createdAt: string;
  modifiedAt: string;
  
  // Filter data
  filters: FolderFilter[];
  hasFilters: boolean;
  filterCount: number;
  filtersByOperator: Record<string, FolderFilter[]>;
  filtersByLogicalGroup: Record<string, FolderFilter[]>;
  uniqueFilterFields: FilterField[];
  
  // Parent folders
  parentFolders: Array<{ id: number; name: string; }>;
  availableParents: Array<{ value: string; label: string; }>;
  
  // Folder styles
  folderStyles: FolderStyle[];
  availableFolderStyles: Array<{ value: string; label: string; }>;
  
  // Fields grouped by data type
  fieldsByDataType: Record<string, Field[]>;
  totalFields: number;
  
  // Parsed datasource options
  availableUsers: Array<{ id: string; name: string; }>;
  availableCategories: Array<{ id: string; name: string; groupId?: string; }>;
  availableWorkflowStatuses: Array<{ id: string; name: string; }>;
  availableAssetTypes: Array<{ id: string; name: string; }>;
  
  // Operators
  operators: string[];
  operatorOptions: Array<{ value: string; label: string; }>;
  
  // Computed properties
  isSmartFolder: boolean;
  hasParent: boolean;
  pathDepth: number;
  folderHierarchy: string[];
  
  // Raw data
  rawFolder: Folder;
  rawFields: Field[];
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getFolderDetails = async ({ queryKey }: FolderDetailsQueryKeys) => {
  const [, { folderId }] = queryKey;
  const response = await axios.get<GetFolderDetailsResponse>(
    apiUrls.folder.details(folderId)
  );

  return response.data;
};

// ===========================================
// DATASOURCE PARSING FUNCTIONS
// ===========================================

export const parseUserDataSource = (datasource: string | null): UserDataSource[] => {
  if (!datasource) return [];
  try {
    const options =  JSON.parse(datasource);
    return options.map((item: UserDataSource) => ({
      label: item.Name,
      value: item.Id,
  }));
  } catch {
    return [];
  }
};

export const parseCategoryDataSource = (datasource: string | null): CategoryDataSource[] => {
  if (!datasource) return [];
  try {
    const options =  JSON.parse(datasource);
    return options.map((item: CategoryDataSource) => ({
      label: item.Name,
      value: item.Id,
  }));
  } catch {
    return [];
  }
};

export const parseWorkflowStatusDataSource = (datasource: string | null): WorkflowStatusDataSource[] => {
  if (!datasource) return [];
  try {
    const options =  JSON.parse(datasource);
    return options.map((item: WorkflowStatusDataSource) => ({
      label: item.Name,
      value: item.Id,
  }));
  } catch {
    return [];
  }
};



export const parseAssetTypeDataSource = (datasource: string | null): AssetTypeDataSource[] => {
  if (!datasource) return [];
  try {
    const options =  JSON.parse(datasource);
    return options.map((item: AssetTypeDataSource) => ({
      label: item.Name,
      value: item.Id,
  }));
  } catch {
    return [];
  }
};

// ===========================================
// DATA TYPE CHECKERS
// ===========================================

export const isUserDataType = (dataType: DataType): boolean => {
  return dataType.name === 'user';
};

export const isCategoryDataType = (dataType: DataType): boolean => {
  return dataType.name === 'category' || dataType.name === 'categorygroup';
};

export const isWorkflowStatusDataType = (dataType: DataType): boolean => {
  return dataType.name === 'workflowstatus';
};

export const isAssetTypeDataType = (dataType: DataType): boolean => {
  return dataType.name === 'assettype';
};

// ===========================================
// DATA TRANSFORMATION FUNCTIONS
// ===========================================

export const transformFolderDetails = (
  response: GetFolderDetailsResponse
): TransformedFolderDetails => {
  const { folder, parentFolders, folderStyles, fields, operators } = response;

  // Group filters by operator
  const filtersByOperator: Record<string, FolderFilter[]> = {};
  folder.filters.forEach(filter => {
    if (!filtersByOperator[filter.operator]) {
      filtersByOperator[filter.operator] = [];
    }
    filtersByOperator[filter.operator].push(filter);
  });

  // Group filters by logical group
  const filtersByLogicalGroup: Record<string, FolderFilter[]> = {};
  folder.filters.forEach(filter => {
    if (!filtersByLogicalGroup[filter.logicalGroup]) {
      filtersByLogicalGroup[filter.logicalGroup] = [];
    }
    filtersByLogicalGroup[filter.logicalGroup].push(filter);
  });

  // Extract unique filter fields
  const uniqueFilterFields = folder.filters
    .map(filter => filter.field)
    .filter((field, index, self) => 
      self.findIndex(f => f.id === field.id) === index
    );

  // Transform parent folders to select options
  const availableParents = parentFolders.map(parent => ({
    value: parent.id.toString(),
    label: parent.name,
  }));

  // Transform folder styles to select options
  const availableFolderStyles = folderStyles.map(style => ({
    value: style.id,
    label: style.name,
  }));

  // Group fields by data type
  const fieldsByDataType: Record<string, Field[]> = {};
  fields.forEach(field => {
    const dataTypeName = field.dataType.name;
    if (!fieldsByDataType[dataTypeName]) {
      fieldsByDataType[dataTypeName] = [];
    }
    fieldsByDataType[dataTypeName].push(field);
  });

  // Parse datasources
  const availableUsers: Array<{ id: string; name: string; }> = [];
  const availableCategories: Array<{ id: string; name: string; groupId?: string; }> = [];
  const availableWorkflowStatuses: Array<{ id: string; name: string; }> = [];
  const availableAssetTypes: Array<{ id: string; name: string; }> = [];

  fields.forEach(field => {
    const { dataType } = field;
    
    if (isUserDataType(dataType)) {
      const users = parseUserDataSource(dataType.datasource);
      availableUsers.push(...users.map(user => ({ 
        id: user.Id, 
        name: user.Name 
      })));
    } else if (isCategoryDataType(dataType)) {
      const categories = parseCategoryDataSource(dataType.datasource);
      availableCategories.push(...categories.map(category => ({ 
        id: category.Id, 
        name: category.Name,
        ...(category.GroupId && { groupId: category.GroupId })
      })));
    } else if (isWorkflowStatusDataType(dataType)) {
      const statuses = parseWorkflowStatusDataSource(dataType.datasource);
      availableWorkflowStatuses.push(...statuses.map(status => ({ 
        id: status.Id, 
        name: status.Name 
      })));
    } else if (isAssetTypeDataType(dataType)) {
      const assetTypes = parseAssetTypeDataSource(dataType.datasource);
      availableAssetTypes.push(...assetTypes.map(type => ({ 
        id: type.Id, 
        name: type.Name 
      })));
    }
  });

  // Remove duplicates
  const uniqueUsers = availableUsers.filter((user, index, self) => 
    self.findIndex(u => u.id === user.id) === index
  );
  const uniqueCategories = availableCategories.filter((category, index, self) => 
    self.findIndex(c => c.id === category.id) === index
  );
  const uniqueStatuses = availableWorkflowStatuses.filter((status, index, self) => 
    self.findIndex(s => s.id === status.id) === index
  );
  const uniqueAssetTypes = availableAssetTypes.filter((type, index, self) => 
    self.findIndex(t => t.id === type.id) === index
  );

  // Transform operators to select options
  const operatorOptions = operators.map(operator => ({
    value: operator,
    label: operator.replace(/_/g, ' '),
  }));

  // Calculate path depth and hierarchy
  const pathDepth = folder.pathCode.split('.').length;
  const folderHierarchy = folder.pathCode.split('.');

  return {
    // Basic folder properties
    id: folder.id,
    name: folder.name,
    description: folder.description,
    index: folder.index,
    level: folder.level,
    pathCode: folder.pathCode,
    parentId: folder.parentId,
    parentName: folder.parentName,
    folderStyle: folder.folderStyle,
    createdAt: folder.createdAt,
    modifiedAt: folder.modifiedAt,
    
    // Filter data
    filters: folder.filters,
    hasFilters: folder.filters.length > 0,
    filterCount: folder.filters.length,
    filtersByOperator,
    filtersByLogicalGroup,
    uniqueFilterFields,
    
    // Parent folders
    parentFolders: parentFolders.map(p => ({ id: p.id, name: p.name })),
    availableParents,
    
    // Folder styles
    folderStyles,
    availableFolderStyles,
    
    // Fields
    fieldsByDataType,
    totalFields: fields.length,
    
    // Parsed datasources
    availableUsers: uniqueUsers,
    availableCategories: uniqueCategories,
    availableWorkflowStatuses: uniqueStatuses,
    availableAssetTypes: uniqueAssetTypes,
    
    // Operators
    operators,
    operatorOptions,
    
    // Computed properties
    isSmartFolder: folder.filters.length > 0,
    hasParent: folder.parentId !== null,
    pathDepth,
    folderHierarchy,
    
    // Raw data
    rawFolder: folder,
    rawFields: fields,
  };
};

// Stable transformation function for React Query select
export const stableTransformFolderDetails = (
  response: GetFolderDetailsResponse
): TransformedFolderDetails => transformFolderDetails(response);

// ===========================================
// CUSTOM HOOK TYPES
// ===========================================

export type UseFolderDetailsProps<TData = TransformedFolderDetails> = {
  folderId: string;
  select?: (response: GetFolderDetailsResponse) => TData;
  enabled?: boolean;
};

// ===========================================
// CUSTOM HOOKS
// ===========================================

// Main hook with transformation
export const useFolderDetails = <TData = TransformedFolderDetails>({
  folderId,
  select,
  enabled = true,
}: UseFolderDetailsProps<TData>) =>
  useQuery({
    queryKey: ['folder-details', { folderId }],
    queryFn: getFolderDetails,
    select: select || (stableTransformFolderDetails as (response: GetFolderDetailsResponse) => TData),
    enabled: enabled && !!folderId,
  });

// Hook for raw folder details without transformation
export const useFolderDetailsRaw = (folderId: string, enabled: boolean = true) =>
  useQuery({
    queryKey: ['folder-details-raw', { folderId }],
    queryFn: getFolderDetails,
    enabled: enabled && !!folderId,
  });

// Specialized hooks for specific data slices
export const useFolderBasicInfo = (folderId: string) =>
  useFolderDetails({
    folderId,
    select: (data) => ({
      id: data.folder.id,
      name: data.folder.name,
      description: data.folder.description,
      parentId: data.folder.parentId,
      parentName: data.folder.parentName,
      folderStyle: data.folder.folderStyle,
      isSmartFolder: data.folder.filters.length > 0,
      level: data.folder.level,
      pathCode: data.folder.pathCode,
    }),
    enabled: !!folderId,
  });

export const useFolderFilters = (folderId: string) =>
  useFolderDetails({
    folderId,
    select: (data) => ({
      filters: data.folder.filters,
      hasFilters: data.folder.filters.length > 0,
      filterCount: data.folder.filters.length,
      uniqueFields: data.folder.filters
        .map(f => f.field)
        .filter((field, index, self) => 
          self.findIndex(f => f.id === field.id) === index
        ),
      operators: [...new Set(data.folder.filters.map(f => f.operator))],
      logicalGroups: [...new Set(data.folder.filters.map(f => f.logicalGroup))],
    }),
  });

export const useFolderHierarchy = (folderId: string) =>
  useFolderDetails({
    folderId,
    select: (data) => ({
      id: data.folder.id,
      name: data.folder.name,
      parentId: data.folder.parentId,
      parentName: data.folder.parentName,
      level: data.folder.level,
      pathCode: data.folder.pathCode,
      pathDepth: data.folder.pathCode.split('.').length,
      folderHierarchy: data.folder.pathCode.split('.'),
      hasParent: data.folder.parentId !== null,
    }),
  });

export const useFolderParentOptions = (folderId: string) =>
  useFolderDetails({
    folderId,
    select: (data) => ({
      parentFolders: data.parentFolders.map(parent => ({
        id: parent.id,
        name: parent.name,
        value: parent.id.toString(),
        label: parent.name,
      })),
      currentParentId: data.folder.parentId,
      currentParentName: data.folder.parentName,
    }),
  });

export const useFolderStyleOptions = (folderId: string) =>
  useFolderDetails({
    folderId,
    select: (data) => ({
      folderStyles: data.folderStyles.map(style => ({
        value: style.id,
        label: style.name,
      })),
      currentFolderStyle: data.folder.folderStyle,
    }),
  });

export const useFolderFieldOptions = (folderId: string) =>
  useFolderDetails({
    folderId,
    select: (data) => {
      const transformed = transformFolderDetails(data);
      return {
        users: transformed.availableUsers.map(u => ({ value: u.id, label: u.name })),
        categories: transformed.availableCategories.map(c => ({ value: c.id, label: c.name })),
        workflowStatuses: transformed.availableWorkflowStatuses.map(s => ({ value: s.id, label: s.name })),
        assetTypes: transformed.availableAssetTypes.map(t => ({ value: t.id, label: t.name })),
        fields: data.fields.map(f => ({ 
          id: f.id, 
          value: f.fieldName, 
          label: f.displayName,
          dataType: f.dataType.name
        })),
      };
    },
  });

export const useFolderOperatorOptions = (folderId: string) =>
  useFolderDetails({
    folderId,
    select: (data) => ({
      operators: data.operators.map(operator => ({
        value: operator,
        label: operator.replace(/_/g, ' '),
      })),
    }),
  });

export const useFolderMetadata = (folderId: string) =>
  useFolderDetails({
    folderId,
    select: (data) => ({
      totalFields: data.fields.length,
      operatorCount: data.operators.length,
      hasFilters: data.folder.filters.length > 0,
      totalParentFolders: data.parentFolders.length,
      folderStyleOptions: data.folderStyles,
      createdAt: data.folder.createdAt,
      modifiedAt: data.folder.modifiedAt,
    }),
  });

// Hook for form data (useful for edit forms)
export const useFolderFormData = (folderId: string) =>
  useFolderDetails({
    folderId,
    select: (data) => ({
      folder: {
        id: data.folder.id,
        name: data.folder.name,
        description: data.folder.description || '',
        index: data.folder.index,
        parentId: data.folder.parentId,
        parentName: data.folder.parentName,
        folderStyle: data.folder.folderStyle || '',
        filters: data.folder.filters.map((filter, index) => ({
          id: `filter-${index}`,
          fieldId: filter.field.id,
          fieldName: filter.field.name,
          operator: filter.operator,
          value: filter.value,
          logicalGroup: filter.logicalGroup,
          sortOrder: filter.sortOrder,
        })),
      },
      availableOptions: {
        folderStyles: data.folderStyles,
        operators: data.operators,
        parentFolders: data.parentFolders,
        fields: data.fields,
      },
    }),
  });

// Hook for select dropdown options
export const useFolderSelectOptions = (folderId: string) =>
  useFolderDetails({
    folderId,
    select: (data) => {
      const transformed = transformFolderDetails(data);
      return {
        parentFolderOptions: transformed.availableParents,
        folderStyleOptions: transformed.availableFolderStyles,
        operatorOptions: transformed.operatorOptions,
        userOptions: transformed.availableUsers.map(u => ({ value: u.id, label: u.name })),
        categoryOptions: transformed.availableCategories.map(c => ({ value: c.id, label: c.name })),
        workflowStatusOptions: transformed.availableWorkflowStatuses.map(s => ({ value: s.id, label: s.name })),
        assetTypeOptions: transformed.availableAssetTypes.map(t => ({ value: t.id, label: t.name })),
        fieldOptions: data.fields.map(f => ({ 
          value: f.id.toString(), 
          label: f.displayName,
          fieldName: f.fieldName,
          dataType: f.dataType.name
        })),
      };
    },
  });

// ===========================================
// UTILITY HOOKS FOR CONDITIONAL QUERIES
// ===========================================

// Hook that only runs when folder ID changes
export const useFolderDetailsWhenReady = (
  folderId: string | null | undefined,
  additionalCondition: boolean = true
) =>
  useFolderDetails({
    folderId: folderId || '',
    enabled: !!folderId && additionalCondition,
  });

// Hook with retry logic for failed requests
export const useFolderDetailsWithRetry = (folderId: string, retryCount: number = 3) =>
  useQuery({
    queryKey: ['folder-details-retry', { folderId }],
    queryFn: getFolderDetails,
    select: stableTransformFolderDetails,
    enabled: !!folderId,
    retry: retryCount,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

// ===========================================
// UTILITY FUNCTIONS FOR FILTERS
// ===========================================

// Helper function to convert filters to readable format
export const formatFiltersForDisplay = (filters: FolderFilter[]): string[] => {
  return filters.map(filter => 
    `${filter.field.name} ${filter.operator} "${filter.value}" (${filter.logicalGroup})`
  );
};

// Helper function to group filters by field
export const groupFiltersByField = (filters: FolderFilter[]): Record<string, FolderFilter[]> => {
  const grouped: Record<string, FolderFilter[]> = {};
  filters.forEach(filter => {
    const fieldName = filter.field.name;
    if (!grouped[fieldName]) {
      grouped[fieldName] = [];
    }
    grouped[fieldName].push(filter);
  });
  return grouped;
};

// Helper function to validate filter structure
export const isValidFilter = (filter: FolderFilter): boolean => {
  return !!(
    filter.field &&
    filter.field.id &&
    filter.field.name &&
    filter.operator &&
    filter.value &&
    ['AND', 'OR'].includes(filter.logicalGroup)
  );
};

// Helper function to sort filters by sortOrder
export const sortFiltersBySortOrder = (filters: FolderFilter[]): FolderFilter[] => {
  return [...filters].sort((a, b) => a.sortOrder - b.sortOrder);
};

// ===========================================
// UTILITY FUNCTIONS FOR PARENT FOLDERS
// ===========================================

// Helper function to find parent folder by ID
export const findParentFolderById = (
  parentFolders: ParentFolder[], 
  parentId: number | null
): ParentFolder | null => {
  if (!parentId) return null;
  return parentFolders.find(p => p.id === parentId) || null;
};

// Helper function to validate if a parent folder exists
export const isValidParentFolder = (parentFolders: ParentFolder[], parentId: number): boolean => {
  return parentFolders.some(parent => parent.id === parentId);
};

// Helper function to get parent folder hierarchy
export const getParentFolderHierarchy = (
  parentFolders: ParentFolder[],
  pathCode: string
): ParentFolder[] => {
  const ids = pathCode.split('.').map(Number);
  return ids
    .map(id => parentFolders.find(p => p.id === id))
    .filter((p): p is ParentFolder => p !== undefined);
};

// ===========================================
// UTILITY FUNCTIONS FOR FOLDER STYLES
// ===========================================

// Helper function to find folder style by ID
export const findFolderStyleById = (
  folderStyles: FolderStyle[], 
  styleId: string | null
): FolderStyle | null => {
  if (!styleId) return null;
  return folderStyles.find(s => s.id === styleId) || null;
};

// Helper function to get default folder style
export const getDefaultFolderStyle = (folderStyles: FolderStyle[]): FolderStyle | null => {
  return folderStyles.find(s => s.id === 'Default') || folderStyles[0] || null;
};

// ===========================================
// UTILITY FUNCTIONS FOR FIELDS
// ===========================================

// Helper function to find field by ID
export const findFieldById = (fields: Field[], fieldId: number): Field | null => {
  return fields.find(f => f.id === fieldId) || null;
};

// Helper function to find field by fieldName
export const findFieldByName = (fields: Field[], fieldName: string): Field | null => {
  return fields.find(f => f.fieldName === fieldName) || null;
};

// Helper function to get fields by data type
export const getFieldsByDataType = (fields: Field[], dataTypeName: string): Field[] => {
  return fields.filter(f => f.dataType.name === dataTypeName);
};

// Helper function to check if field has datasource
export const hasFieldDatasource = (field: Field): boolean => {
  return field.dataType.datasource !== null && field.dataType.datasource !== '';
};
