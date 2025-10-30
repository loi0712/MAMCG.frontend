// models/folder.ts

export interface Folder {
    id: number;
    name: string;
    description: string | null;
    index: number;
    level: number;
    pathCode: string;
    parentId: number | null;
    folderStyle: number | null;
    createdAt: string;
    modifiedAt: string;
    hasChilds: boolean;
    projectCode: string | null;
    childs: Folder[];
  }
  
//   export interface Filter {
//     // Add filter properties based on your actual filter structure
//     // Currently appears to be an empty array in your JSON
//     [key: string]: any;
//   }
  
//   // Optional: Create a type for the root folder list
//   export type FolderList = Folder[];
  
//   // Optional: Create a type for folder creation/update (without computed fields)
//   export interface CreateFolderRequest {
//     name: string;
//     description?: string | null;
//     index: number;
//     level: number;
//     parentId?: number | null;
//     folderStyle?: number | null;
//     projectCode?: string | null;
//   }
  
//   export interface UpdateFolderRequest extends Partial<CreateFolderRequest> {
//     id: number;
//   }
  
//   // Optional: Create an enum for folder styles if you have specific values
//   export enum FolderStyle {
//     DEFAULT = 0,
//     STYLE_1 = 1,
//     STYLE_2 = 2,
//     // Add more styles as needed
//   }
  
//   // Utility types for working with folders
//   export interface FlatFolder extends Omit<Folder, 'childs'> {
//     // Flattened version without nested children
//   }
  
//   // Helper type for folder tree operations
//   export interface FolderTreeNode {
//     folder: Folder;
//     depth: number;
//     isExpanded?: boolean;
//     isSelected?: boolean;
//   }
  