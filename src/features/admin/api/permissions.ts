import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'

// ===========================================
// TYPES (Identity: PermissionDto, UserGroupACEDto, CreateACEDto)
// ===========================================

export type TargetType = 'USER' | 'GROUP'

export interface Permission {
  id: number
  name: string | null
  description: string | null
  childrens: Permission[] | null
}

export interface TargetPermission {
  targetType: TargetType
  targetId: string | null
  // Danh sách id quyền, phân tách bởi dấu phẩy
  permissionIds: string
}

export interface TargetPermissionResponse {
  permission: TargetPermission | null
  permissionTree: Permission[]
}

export interface SavePermissionRequest {
  targetType: TargetType
  targetId: string
  // Backend parse bằng int.Parse: không được rỗng
  permissionIds: string
}

// Quyền trên một thư mục (Identity: FolderACEDto, GetFolderPermissionsResponseDto, CreateFolderPermissionDto)
export interface FolderPermissionEntry {
  targetType: TargetType
  targetId: string | null
  permissionIds: string
  objectId?: number | null
}

export interface FolderPermissionsResponse {
  folderPermission: FolderPermissionEntry[]
  // Cây quyền gán được theo thư mục (máy chủ đã bỏ quyền quản trị hệ thống)
  permissionTree: Permission[]
  users: Array<{ id: string; username: string | null; fullName: string | null; isActive: boolean }>
  groups: Array<{ id: number; name: string | null }>
}

export interface SaveFolderPermissionsRequest {
  folderId: number
  // Danh sách rỗng = gỡ hết quyền trên thư mục
  permissions: Array<{ targetType: TargetType; targetId: string; permissionIds: string }>
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getTargetPermissions = async (targetType: TargetType, targetId: string) => {
  const res = await axios.get<TargetPermissionResponse>(apiUrls.permission.byTarget, {
    params: { targetType, targetId },
  })
  return res.data
}

export interface MyAccess {
  isAdmin: boolean
}

// Quyền "Quản trị hệ thống" (ADMIN) của người dùng đang đăng nhập
export const getMyAccess = async () => {
  const res = await axios.get<MyAccess>(apiUrls.permission.me)
  return res.data
}

export const getFolderPermissions = async (folderId: string) => {
  const res = await axios.get<FolderPermissionsResponse>(apiUrls.permission.folder(folderId))
  return res.data
}

export const saveFolderPermissions = async (data: SaveFolderPermissionsRequest) => {
  const res = await axios.post<boolean>(apiUrls.permission.folderSave, data)
  return res.data
}

export const savePermissions = async (data: SavePermissionRequest) => {
  const res = await axios.post<boolean>(apiUrls.permission.create, data)
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useMyAccess = () =>
  useQuery({ queryKey: ['my-access'], queryFn: getMyAccess, staleTime: 5 * 60 * 1000 })

export const useTargetPermissions = (targetType: TargetType, targetId: string | null) =>
  useQuery({
    queryKey: ['admin-permissions', targetType, targetId],
    queryFn: () => getTargetPermissions(targetType, targetId!),
    enabled: !!targetId,
  })

export const useFolderPermissions = (folderId: string | null) =>
  useQuery({
    queryKey: ['folder-permissions', folderId],
    queryFn: () => getFolderPermissions(folderId!),
    enabled: !!folderId,
  })

export const useSaveFolderPermissions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveFolderPermissions,
    onSuccess: (_data, variables) => {
      toast.success('Đã lưu phân quyền thư mục')
      queryClient.invalidateQueries({ queryKey: ['folder-permissions', String(variables.folderId)] })
    },
  })
}

export const useSavePermissions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: savePermissions,
    onSuccess: (_data, variables) => {
      toast.success('Đã lưu phân quyền')
      queryClient.invalidateQueries({
        queryKey: ['admin-permissions', variables.targetType, variables.targetId],
      })
    },
  })
}

// Id của mọi quyền trong cây (kể cả quyền con)
export const flattenPermissionIds = (tree: Permission[]): number[] =>
  tree.flatMap((p) => [p.id, ...flattenPermissionIds(p.childrens ?? [])])

export const parsePermissionIds = (ids: string | null | undefined): number[] =>
  (ids ?? '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)
