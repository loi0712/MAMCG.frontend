// ===========================================
// CORE FOLDER TYPES (Existing)
// ===========================================

export type TFolder = {
    id: number;
    name: string;
    description: string | null;
    index: number | null;
    level: number | null;
    pathCode: string | null;
    parentId: number | null;
    folderStyle: number | null;
    hasChilds: boolean | null;
    projectCode: string | null;
    childs: TFolder[];
}

export type TParentFolders = {
    id: number,
    name: string
}

export type TQueryKeys = {
    parentId?: string,
    isGetAll: boolean
}

export type GetFoldersProps = {
    queryKey: [string, TQueryKeys];
};

export type TFoldersResponse = TFolder[];

// ===========================================
// FOLDER FILTER TYPES
// ===========================================

export interface TFolderFilter {
    fieldId: number;
    operator: string;
    value: string;
    logicalGroup: 'AND' | 'OR';
    sortOrder: number;
}

// ===========================================
// FOLDER CRUD TYPES
// ===========================================

export interface TCreateFolder {
    id: number | null;
    name: string;
    description: string | null;
    index: number;
    parentId?: number | null;
    parentName: string | null;
    folderStyle: 'Default' | 'Category' | 'Project';
    projectCode: string;
    filters: TFolderFilter[];
}

export interface TUpdateFolder {
    id: number;
    name: string;
    description: string;
    index: number;
    parentId: number;
    parentName: string;
    folderStyle: 'Default' | 'Category' | 'Project';
    projectCode: string;
    filters: TFolderFilter[];
}

// ===========================================
// FOLDER DETAILS API TYPES (New)
// ===========================================

export type FolderStyleType = 'Default' | 'Category' | 'Project';

export type DataTypeName = 
  | 'singleline' 
  | 'datetime' 
  | 'user' 
  | 'project' 
  | 'category' 
  | 'workflowstatus';

export type OperatorType = 
  | 'EQUALS'
  | 'NOT_EQUALS' 
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN_OR_EQUAL'
  | 'STARTS_WITH'
  | 'ENDS_WITH';

// ===========================================
// DATA SOURCE TYPES
// ===========================================

export interface UserDataSource {
    Id: number;
    FullName: string;
}

export interface ProjectDataSource {
    Id: number;
    Name: string;
}

export interface CategoryDataSource {
    Id: number;
    Name: string;
}

export interface WorkflowStatusDataSource {
    Id: number;
    Name: string;
}

// ===========================================
// DATA TYPE DISCRIMINATED UNION
// ===========================================

interface BaseDataType {
    id: number;
    name: DataTypeName;
}

export interface SinglelineDataType extends BaseDataType {
    name: 'singleline';
    datasource: null;
}

export interface DatetimeDataType extends BaseDataType {
    name: 'datetime';
    datasource: null;
}

export interface UserDataType extends BaseDataType {
    name: 'user';
    datasource: string; // JSON string containing UserDataSource[]
}

export interface ProjectDataType extends BaseDataType {
    name: 'project';
    datasource: string; // JSON string containing ProjectDataSource[]
}

export interface CategoryDataType extends BaseDataType {
    name: 'category';
    datasource: string; // JSON string containing CategoryDataSource[]
}

export interface WorkflowStatusDataType extends BaseDataType {
    name: 'workflowstatus';
    datasource: string; // JSON string containing WorkflowStatusDataSource[]
}

// Union type for all DataType variants
export type DataType = 
  | SinglelineDataType
  | DatetimeDataType 
  | UserDataType
  | ProjectDataType
  | CategoryDataType
  | WorkflowStatusDataType;

// ===========================================
// FOLDER DETAILS RESPONSE TYPES
// ===========================================

export interface FolderStyle {
    id: FolderStyleType;
    name: string;
}

export interface Field {
    id: number;
    displayName: string;
    dataType: DataType;
}

export interface ParentFolders {
    id: number;
    name: string;
}

export interface FolderDetails {
    id: number;
    name: string;
    description: string | null;
    index: number;
    level: number;
    pathCode: string;
    parentId: number | null;
    parentName: string | null;
    folderStyle: number;
    createdAt: string;
    modifiedAt: string;
    projectCode: string | null;
    filters: TFolderFilter[];
}

export interface GetFolderDetailsResponse {
    folder: FolderDetails;
    parentFolders: ParentFolders[];
    folderStyles: FolderStyle[];
    fields: Field[];
    operators: OperatorType[];
}

// ===========================================
// TYPE GUARDS FOR DATA TYPES
// ===========================================

export const isUserDataType = (dataType: DataType): dataType is UserDataType => {
    return dataType.name === 'user';
};

export const isProjectDataType = (dataType: DataType): dataType is ProjectDataType => {
    return dataType.name === 'project';
};

export const isCategoryDataType = (dataType: DataType): dataType is CategoryDataType => {
    return dataType.name === 'category';
};

export const isWorkflowStatusDataType = (dataType: DataType): dataType is WorkflowStatusDataType => {
    return dataType.name === 'workflowstatus';
};

export const isDatetimeDataType = (dataType: DataType): dataType is DatetimeDataType => {
    return dataType.name === 'datetime';
};

export const isSinglelineDataType = (dataType: DataType): dataType is SinglelineDataType => {
    return dataType.name === 'singleline';
};

// ===========================================
// DATA SOURCE PARSER UTILITIES
// ===========================================

export const parseUserDataSource = (datasource: string): UserDataSource[] => {
    try {
        return JSON.parse(datasource) as UserDataSource[];
    } catch (error) {
        console.warn('Failed to parse user datasource:', error);
        return [];
    }
};

export const parseProjectDataSource = (datasource: string): ProjectDataSource[] => {
    try {
        return JSON.parse(datasource) as ProjectDataSource[];
    } catch (error) {
        console.warn('Failed to parse project datasource:', error);
        return [];
    }
};

export const parseCategoryDataSource = (datasource: string): CategoryDataSource[] => {
    try {
        return JSON.parse(datasource) as CategoryDataSource[];
    } catch (error) {
        console.warn('Failed to parse category datasource:', error);
        return [];
    }
};

export const parseWorkflowStatusDataSource = (datasource: string): WorkflowStatusDataSource[] => {
    try {
        return JSON.parse(datasource) as WorkflowStatusDataSource[];
    } catch (error) {
        console.warn('Failed to parse workflow status datasource:', error);
        return [];
    }
};

// ===========================================
// GENERIC DATA SOURCE PARSER
// ===========================================

export const parseDataSource = <T>(
    dataType: DataType, 
    parser: (datasource: string) => T[]
): T[] => {
    if (dataType.datasource) {
        return parser(dataType.datasource);
    }
    return [];
};

// Generic field data source getter with type safety
export const getFieldDataSource = (field: Field): unknown[] => {
    const { dataType } = field;
    
    if (isUserDataType(dataType)) {
        return parseUserDataSource(dataType.datasource);
    }
    if (isProjectDataType(dataType)) {
        return parseProjectDataSource(dataType.datasource);
    }
    if (isCategoryDataType(dataType)) {
        return parseCategoryDataSource(dataType.datasource);
    }
    if (isWorkflowStatusDataType(dataType)) {
        return parseWorkflowStatusDataSource(dataType.datasource);
    }
    
    return [];
};

// ===========================================
// UTILITY TYPES FOR FIELD EXTRACTION
// ===========================================

// Extract specific field types for type safety
export type UserField = Extract<Field, { dataType: UserDataType }>;
export type ProjectField = Extract<Field, { dataType: ProjectDataType }>;
export type CategoryField = Extract<Field, { dataType: CategoryDataType }>;
export type DateTimeField = Extract<Field, { dataType: DatetimeDataType }>;
export type SinglelineField = Extract<Field, { dataType: SinglelineDataType }>;
export type WorkflowStatusField = Extract<Field, { dataType: WorkflowStatusDataType }>;

// Helper type for parsed datasource based on DataType
export type ParsedDataSource<T extends DataType> = 
    T extends UserDataType ? UserDataSource[] :
    T extends ProjectDataType ? ProjectDataSource[] :
    T extends CategoryDataType ? CategoryDataSource[] :
    T extends WorkflowStatusDataType ? WorkflowStatusDataSource[] :
    never;

// ===========================================
// FOLDER STYLE MAPPING UTILITIES  
// ===========================================

// Helper to map folderStyle number to string
export const mapFolderStyleToString = (
    folderStyleId: number, 
    folderStyles: FolderStyle[]
): FolderStyleType | null => {
    const style = folderStyles.find(style => {
        // Assuming the mapping: Default=0, Category=1, Project=2
        if (folderStyleId === 0) return style.id === 'Default';
        if (folderStyleId === 1) return style.id === 'Category';
        if (folderStyleId === 2) return style.id === 'Project';
        return false;
    });
    
    return style?.id || null;
};

// Helper to map folderStyle string to number
export const mapFolderStyleToNumber = (folderStyle: FolderStyleType): number => {
    switch (folderStyle) {
        case 'Default': return 0;
        case 'Category': return 1;
        case 'Project': return 2;
        default: return 0;
    }
};

// ===========================================
// CONVERSION UTILITIES
// ===========================================

// Convert TFolder to FolderDetails format
export const convertTFolderToFolderDetails = (
    folder: TFolder, 
    // folderStyles: FolderStyle[]
): Partial<FolderDetails> => {
    // const folderStyleString = folder.folderStyle 
    //     ? mapFolderStyleToString(folder.folderStyle, folderStyles)
    //     : null;
    
    return {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        index: folder.index || 0,
        level: folder.level || 0,
        pathCode: folder.pathCode || '',
        parentId: folder.parentId,
        folderStyle: folder.folderStyle || 0,
        projectCode: folder.projectCode,
        filters: [] // Default empty filters
    };
};

// ===========================================
// VALIDATION TYPES
// ===========================================

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface FolderValidationRules {
    name: {
        required: boolean;
        minLength: number;
        maxLength: number;
    };
    description: {
        maxLength: number;
    };
    folderStyle: {
        required: boolean;
        allowedValues: FolderStyleType[];
    };
}

// Default validation rules
export const DEFAULT_FOLDER_VALIDATION_RULES: FolderValidationRules = {
    name: {
        required: true,
        minLength: 1,
        maxLength: 255,
    },
    description: {
        maxLength: 1000,
    },
    folderStyle: {
        required: true,
        allowedValues: ['Default', 'Category', 'Project'],
    },
};

// ===========================================
// API ERROR TYPES
// ===========================================

export interface ApiErrorResponse {
    error: string;
    message?: string;
    statusCode?: number;
}

export interface DeleteFolderDetailsDTO {
    id: string;
}

export interface UpdateFolderDetailsDTO extends Omit<TUpdateFolder, 'id'> {
    id: string;
}

export type CreateFolderDetailsDTO = Omit<TCreateFolder, 'id'>;
