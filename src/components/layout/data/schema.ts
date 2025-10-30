import { z } from 'zod'

const folderStyleSchema = z.union([
  z.literal('Default'),
  z.literal('Grid'),
  z.literal('List'),
  z.literal('Card'),
  z.literal('Timeline'),
])
export type FolderStyle = z.infer<typeof folderStyleSchema>

const folderStatusSchema = z.union([
  z.literal('active'),
  z.literal('archived'),
  z.literal('pending'),
  z.literal('deleted'),
])
export type FolderStatus = z.infer<typeof folderStatusSchema>

const baseFolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parentId: z.number(),
  folderStyle: folderStyleSchema,
  projectCode: z.string(),
  index: z.number(),
  status: folderStatusSchema.default('active'),
  hasChilds: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

// Define the folder type first
export type Folder = z.infer<typeof baseFolderSchema> & {
  childs?: Folder[]
}

// Then create the recursive schema
export const folderSchema: z.ZodType<Folder> = baseFolderSchema.extend({
  childs: z.lazy(() => z.array(folderSchema)).optional(),
})

export const folderListSchema = z.array(folderSchema)

// Additional schemas for API operations
export const createFolderSchema = z.object({
  name: z.string().min(1, 'Tên thư mục là bắt buộc.'),
  description: z.string().min(1, 'Mô tả thư mục là bắt buộc.'),
  parentId: z.number().min(0),
  folderStyle: folderStyleSchema.default('Default'),
  projectCode: z.string().min(1, 'Mã dự án là bắt buộc.'),
  index: z.number().min(0).default(0),
})
export type CreateFolder = z.infer<typeof createFolderSchema>

export const updateFolderSchema = createFolderSchema.partial().extend({
  id: z.string(),
})
export type UpdateFolder = z.infer<typeof updateFolderSchema>

// Filter schema for folder queries
export const folderFilterSchema = z.object({
  fieldId: z.number(),
  operator: z.enum([
    'EQUALS',
    'NOT_EQUALS',
    'CONTAINS',
    'NOT_CONTAINS',
    'STARTS_WITH',
    'ENDS_WITH',
    'GREATER_THAN',
    'LESS_THAN',
    'GREATER_THAN_OR_EQUAL',
    'LESS_THAN_OR_EQUAL',
    'IN',
    'NOT_IN',
    'IS_NULL',
    'IS_NOT_NULL'
  ]),
  value: z.string(),
  logicalGroup: z.enum(['AND', 'OR']),
  sortOrder: z.number().min(0),
})
export type FolderFilter = z.infer<typeof folderFilterSchema>

// Query parameters schema
export const folderQuerySchema = z.object({
  parentId: z.string().optional(),
  isGetAll: z.boolean().default(false),
  status: folderStatusSchema.optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  filters: z.array(folderFilterSchema).optional(),
})
export type FolderQuery = z.infer<typeof folderQuerySchema>
