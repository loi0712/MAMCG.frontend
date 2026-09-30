import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import type { components } from '@/api/generated/schema'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'

// ===========================================
// TYPES (Configuration: /api/Setting, /api/LdapConfiguration)
// ===========================================

type Schemas = components['schemas']

export type Setting = Schemas['SettingDto']
export type SettingUpsertItem = Schemas['UpsertSettingItemDto']
export type ConnectionTestResult = Schemas['ConnectionTestResult']
export type LdapConfiguration = Schemas['LdapConfigurationDto']
export type LdapConfigurationRequest = Schemas['SaveLdapConfigurationDto']
export type LdapTestRequest = Schemas['TestLdapDto']
export type LdapSyncResult = Schemas['LdapSyncResultDto']
export type LdapSyncChange = Schemas['LdapSyncChangeDto']
export type LdapUserRecord = Schemas['LdapUserRecord']
export type LdapSyncAction = 'create' | 'update' | 'deactivate' | 'skip'

// Ánh xạ thuộc tính LDAP -> người dùng (mặc định của backend = Active Directory)
export type LdapAttributeMapping = {
  attrUsername: string
  attrFullName: string
  attrEmail: string
  attrPhone: string
  attrDepartment: string
  attrTitle: string
}

export const LDAP_ATTRIBUTE_PRESETS = {
  activeDirectory: {
    attrUsername: 'sAMAccountName',
    attrFullName: 'displayName',
    attrEmail: 'mail',
    attrPhone: 'telephoneNumber',
    attrDepartment: 'department',
    attrTitle: 'title',
  },
  openLdap: {
    attrUsername: 'uid',
    attrFullName: 'cn',
    attrEmail: 'mail',
    attrPhone: 'telephoneNumber',
    attrDepartment: 'departmentNumber',
    attrTitle: 'title',
  },
} as const satisfies Record<string, LdapAttributeMapping>

// Tên thuộc tính LDAP hợp lệ (giống kiểm tra phía backend)
export const LDAP_ATTRIBUTE_PATTERN = /^[A-Za-z][A-Za-z0-9-]{0,99}$/

// Bộ lọc mặc định khi để trống bộ lọc đồng bộ
export const LDAP_DEFAULT_SYNC_FILTER = '(|(&(objectCategory=person)(objectClass=user))(objectClass=inetOrgPerson))'

export const LDAP_SYNC_MAX_INTERVAL = 10080

// lastSyncStatus là thông điệp kết quả; lần lỗi bắt đầu bằng "Không đọc được..." hoặc chứa "thất bại"/"lỗi"
export const isLdapSyncStatusFailed = (status: string | null | undefined) =>
  !!status && /^không đọc được|thất bại|lỗi/i.test(status)

export const formatSyncInterval = (minutes: number | undefined) => {
  if (!minutes) return 'Thủ công'
  if (minutes % 1440 === 0) return `Mỗi ${minutes / 1440} ngày`
  if (minutes % 60 === 0) return `Mỗi ${minutes / 60} giờ`
  return `Mỗi ${minutes} phút`
}

export interface LdapConfigurationsResponse {
  items: LdapConfiguration[]
  totalCount: number
}

// Backend che giá trị bí mật bằng chuỗi này; gửi lại đúng chuỗi = giữ nguyên giá trị đang lưu
export const SECRET_MASK = '********'

// Khoá cấu hình SMTP mà backend dùng để gửi email (EmailSettingKeys)
export const EMAIL_KEYS = {
  host: 'email.smtp.host',
  port: 'email.smtp.port',
  username: 'email.smtp.username',
  password: 'email.smtp.password',
  enableSsl: 'email.smtp.enableSsl',
  fromAddress: 'email.from.address',
  fromName: 'email.from.name',
} as const

export const EMAIL_PREFIX = 'email.'

// Setting[] -> map khoá => giá trị
export const toSettingMap = (settings: Setting[] | undefined) => {
  const map = new Map<string, string>()
  settings?.forEach((s) => s.key && map.set(s.key, s.value ?? ''))
  return map
}

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN')
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getSettings = async (prefix?: string) => {
  const res = await axios.get<Setting[]>(apiUrls.setting.list, { params: prefix ? { prefix } : {} })
  return res.data
}

export const saveSettings = async (items: SettingUpsertItem[]) => {
  const res = await axios.put<Setting[]>(apiUrls.setting.save, items)
  return res.data
}

export const sendTestEmail = async (to: string) => {
  const res = await axios.post<ConnectionTestResult>(apiUrls.setting.testEmail, { to })
  return res.data
}

export const getLdapConfigurations = async (params: PagedParams) => {
  const res = await axios.get<LdapConfigurationsResponse>(apiUrls.ldap.list, { params: toPagedQuery(params) })
  return res.data
}

export const createLdapConfiguration = async (data: LdapConfigurationRequest) => {
  const res = await axios.post<LdapConfiguration>(apiUrls.ldap.create, data)
  return res.data
}

export const updateLdapConfiguration = async ({ id, data }: { id: number; data: LdapConfigurationRequest }) => {
  const res = await axios.put<LdapConfiguration>(apiUrls.ldap.update(id), data)
  return res.data
}

export const deleteLdapConfiguration = async (id: number) => {
  const res = await axios.delete<boolean>(apiUrls.ldap.delete(id))
  return res.data
}

export const testLdapConfiguration = async ({ id, data }: { id: number; data?: LdapTestRequest }) => {
  const res = await axios.post<ConnectionTestResult>(apiUrls.ldap.test(id), data ?? {})
  return res.data
}

export const syncLdapConfiguration = async ({ id, dryRun }: { id: number; dryRun: boolean }) => {
  const res = await axios.post<LdapSyncResult>(apiUrls.ldap.sync(id), null, { params: { dryRun } })
  return res.data
}

export const getLdapUsers = async (id: number, limit = 20) => {
  const res = await axios.get<LdapUserRecord[]>(apiUrls.ldap.users(id), { params: { limit } })
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useSettings = (prefix?: string) =>
  useQuery({ queryKey: ['admin-settings', prefix ?? ''], queryFn: () => getSettings(prefix) })

export const useSaveSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      toast.success('Đã lưu cấu hình')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
  })
}

// Gửi email thử bằng cấu hình SMTP đã lưu; backend trả 200 kể cả khi gửi thất bại (success=false)
export const useSendTestEmail = () =>
  useMutation({
    mutationFn: sendTestEmail,
    onSuccess: (result) => {
      if (result.success) toast.success(result.message ?? 'Đã gửi email thử')
      else toast.error(result.message ?? 'Gửi email thử thất bại')
    },
  })

export const useLdapConfigurations = (params: PagedParams) =>
  useQuery({
    queryKey: ['admin-ldap-configurations', params],
    queryFn: () => getLdapConfigurations(params),
    placeholderData: keepPreviousData,
  })

const useInvalidateLdap = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin-ldap-configurations'] })
}

export const useCreateLdapConfiguration = () => {
  const invalidate = useInvalidateLdap()
  return useMutation({
    mutationFn: createLdapConfiguration,
    onSuccess: () => {
      toast.success('Đã thêm cấu hình LDAP')
      invalidate()
    },
  })
}

export const useUpdateLdapConfiguration = () => {
  const invalidate = useInvalidateLdap()
  return useMutation({
    mutationFn: updateLdapConfiguration,
    onSuccess: () => {
      toast.success('Đã cập nhật cấu hình LDAP')
      invalidate()
    },
  })
}

export const useDeleteLdapConfiguration = () => {
  const invalidate = useInvalidateLdap()
  return useMutation({
    mutationFn: deleteLdapConfiguration,
    onSuccess: () => {
      toast.success('Đã xoá cấu hình LDAP')
      invalidate()
    },
  })
}

// Thử bind tài khoản dịch vụ (và tuỳ chọn xác thực một người dùng)
export const useTestLdapConfiguration = () =>
  useMutation({
    mutationFn: testLdapConfiguration,
    onSuccess: (result) => {
      if (result.success) toast.success(`${result.message ?? 'Kết nối LDAP thành công'} (${result.elapsedMs ?? 0} ms)`)
      else toast.error(result.message ?? 'Kết nối LDAP thất bại')
    },
  })

// Đồng bộ người dùng từ LDAP; dryRun=true chỉ xem trước, không lưu (409 khi đang có lượt đồng bộ khác)
export const useSyncLdapConfiguration = () => {
  const invalidate = useInvalidateLdap()
  return useMutation({
    mutationFn: syncLdapConfiguration,
    onSuccess: (result, { dryRun }) => {
      if (dryRun) return
      if (result.success) toast.success(result.message ?? 'Đồng bộ LDAP hoàn tất')
      else toast.error(result.message ?? 'Đồng bộ LDAP thất bại')
      invalidate()
    },
  })
}

// Xem thử người dùng đọc được từ LDAP theo ánh xạ thuộc tính
export const useLdapUsers = (id: number | undefined, limit = 20) =>
  useQuery({
    queryKey: ['admin-ldap-users', id, limit],
    queryFn: () => getLdapUsers(id ?? 0, limit),
    enabled: !!id,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  })
