import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import {
  LDAP_ATTRIBUTE_PATTERN,
  LDAP_ATTRIBUTE_PRESETS,
  type LdapConfiguration,
  type LdapSyncChange,
  type LdapSyncResult,
  type LdapUserRecord,
  type LdapConfigurationRequest,
  type LdapTestRequest,
  SECRET_MASK,
  type SettingUpsertItem,
} from '@/features/admin/api/settings'
import { api, notFound, paginate } from './utils'

const id = ':id' as unknown as number
const now = () => new Date().toISOString()

// ===========================================
// SETTING (key/value, khoá chứa password/secret/token bị che)
// ===========================================

interface StoredSetting {
  key: string
  value: string | null
  description: string | null
}

const settings: StoredSetting[] = [
  { key: 'email.smtp.host', value: 'smtp.mamcg.vn', description: null },
  { key: 'email.smtp.port', value: '587', description: null },
  { key: 'email.smtp.enableSsl', value: 'true', description: null },
  { key: 'email.smtp.username', value: 'notification@mamcg.vn', description: null },
  { key: 'email.smtp.password', value: 'secret', description: null },
  { key: 'email.from.address', value: 'notification@mamcg.vn', description: null },
  { key: 'email.from.name', value: 'MAMCG Notification', description: null },
]

const isSecretKey = (key: string) => /password|secret|token/i.test(key)
const mask = (value: string | null) => (value ? SECRET_MASK : value)
const resolveSecret = (incoming: string | null | undefined, current: string | null) =>
  incoming === SECRET_MASK ? current : (incoming ?? null)

const toDto = (s: StoredSetting) => {
  const isSecret = isSecretKey(s.key)
  return { key: s.key, value: isSecret ? mask(s.value) : s.value, description: s.description, isSecret }
}

const valueOf = (key: string) => settings.find((s) => s.key === key)?.value ?? null

const badRequest = (title: string) => HttpResponse.json({ title, status: 400 }, { status: 400 })

// ===========================================
// LDAP CONFIGURATION
// ===========================================

let ldapSeq = 100

const ldapConfigs: LdapConfiguration[] = [
  {
    id: 1,
    serverUrl: 'ldap://dc.mamcg.local:389',
    baseDn: 'DC=mamcg,DC=local',
    bindDn: 'CN=svc-mamcg,OU=Service,DC=mamcg,DC=local',
    bindPassword: 'secret',
    useSsl: false,
    filterUsers: '(&(objectClass=user)(sAMAccountName={0}))',
    filterGroups: '(objectClass=group)',
    isActive: true,
    ...LDAP_ATTRIBUTE_PRESETS.activeDirectory,
    syncFilter: null,
    syncEnabled: true,
    syncIntervalMinutes: 60,
    deactivateMissingUsers: false,
    lastSyncAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    lastSyncStatus: 'Tìm thấy 6 người dùng: tạo 0, cập nhật 1, không đổi 4, khoá 0, bỏ qua 1',
    createdAt: now(),
    modifiedAt: now(),
  },
  {
    id: 2,
    serverUrl: 'ldaps://ldap-backup.mamcg.local',
    baseDn: 'dc=mamcg,dc=local',
    bindDn: null,
    bindPassword: null,
    useSsl: true,
    filterUsers: null,
    filterGroups: null,
    isActive: false,
    ...LDAP_ATTRIBUTE_PRESETS.openLdap,
    syncFilter: '(objectClass=inetOrgPerson)',
    syncEnabled: false,
    syncIntervalMinutes: 0,
    deactivateMissingUsers: true,
    lastSyncAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    lastSyncStatus: 'Không đọc được danh sách người dùng từ LDAP: The LDAP server is unavailable.',
    createdAt: now(),
    modifiedAt: now(),
  },
]

const ldapDto = (c: LdapConfiguration): LdapConfiguration => ({ ...c, bindPassword: mask(c.bindPassword ?? null) })

const attrOr = (value: string | null | undefined, fallback: string | null) => value?.trim() || fallback

// Trả thông báo lỗi giống backend (null = hợp lệ)
const validateLdap = (data: LdapConfigurationRequest): string | null => {
  if (!data.serverUrl?.trim()) return 'ServerUrl là bắt buộc'
  const attrs = [data.attrUsername, data.attrFullName, data.attrEmail, data.attrPhone, data.attrDepartment, data.attrTitle]
  const invalid = attrs.map((a) => a?.trim()).find((a) => a && !LDAP_ATTRIBUTE_PATTERN.test(a))
  if (invalid) return `Tên thuộc tính LDAP không hợp lệ: ${invalid}`
  const filter = data.syncFilter?.trim()
  if (filter && (!filter.startsWith('(') || !filter.endsWith(')') || filter.length > 1000))
    return 'Bộ lọc đồng bộ phải là bộ lọc LDAP hợp lệ, vd. (objectClass=person).'
  const interval = data.syncIntervalMinutes ?? 0
  if (interval < 0 || interval > 10080) return 'SyncIntervalMinutes phải trong khoảng 0–10080'
  return null
}

const applyLdap = (target: LdapConfiguration, data: LdapConfigurationRequest) => {
  const ad = LDAP_ATTRIBUTE_PRESETS.activeDirectory
  Object.assign(target, {
    serverUrl: data.serverUrl.trim(),
    baseDn: data.baseDn?.trim() ?? null,
    bindDn: data.bindDn?.trim() ?? null,
    bindPassword: resolveSecret(data.bindPassword, target.bindPassword ?? null),
    useSsl: data.useSsl ?? false,
    filterUsers: data.filterUsers?.trim() ?? null,
    filterGroups: data.filterGroups?.trim() ?? null,
    isActive: data.isActive ?? true,
    attrUsername: attrOr(data.attrUsername, ad.attrUsername),
    attrFullName: attrOr(data.attrFullName, ad.attrFullName),
    attrEmail: attrOr(data.attrEmail, ad.attrEmail),
    attrPhone: attrOr(data.attrPhone, null),
    attrDepartment: attrOr(data.attrDepartment, null),
    attrTitle: attrOr(data.attrTitle, null),
    syncFilter: data.syncFilter?.trim() || null,
    syncEnabled: data.syncEnabled ?? false,
    syncIntervalMinutes: Math.max(0, data.syncIntervalMinutes ?? 0),
    deactivateMissingUsers: data.deactivateMissingUsers ?? false,
    modifiedAt: now(),
  })
}

// Người dùng giả lập đọc được từ LDAP
const ldapUsers = (config: LdapConfiguration): LdapUserRecord[] => {
  const base = config.baseDn ?? 'DC=mamcg,DC=local'
  const rows: [string, string, string | null, string | null, string | null, boolean][] = [
    ['nguyenvana', 'Nguyễn Văn A', '0901234567', 'Phòng Kỹ thuật', 'Kỹ sư', false],
    ['tranthib', 'Trần Thị B', '0912345678', 'Phòng Sản xuất', 'Biên tập viên', false],
    ['levanc', 'Lê Văn C', null, 'Phòng Kỹ thuật', 'Trưởng phòng', false],
    ['phamthid', 'Phạm Thị D', '0987654321', 'Phòng Đồ hoạ', 'Thiết kế đồ hoạ', false],
    ['hoangvane', 'Hoàng Văn E', null, null, null, true],
    ['admin', 'Administrator (LDAP)', null, 'IT', null, false],
  ]
  return rows.map(([username, fullName, phone, department, title, disabled], i) => ({
    distinguishedName: `CN=${fullName},OU=Users,${base}`,
    externalId: `S-1-5-21-3623811015-3361044348-30300820-${1100 + i}`,
    username,
    fullName,
    email: `${username}@mamcg.vn`,
    phone: config.attrPhone ? phone : null,
    department: config.attrDepartment ? department : null,
    title: config.attrTitle ? title : null,
    disabled,
  }))
}

const runningSyncs = new Set<number>()
let mockSyncCount = 0

const mockSync = (config: LdapConfiguration, dryRun: boolean): LdapSyncResult => {
  const configurationId = config.id ?? 0
  if (config.serverUrl?.includes('backup')) {
    return {
      configurationId,
      dryRun,
      success: false,
      found: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      deactivated: 0,
      skipped: 0,
      departmentsCreated: 0,
      positionsCreated: 0,
      message: 'Không đọc được danh sách người dùng từ LDAP: The LDAP server is unavailable.',
      changes: [],
      elapsedMs: 10012,
    }
  }
  // Sau lần đồng bộ thật đầu tiên, các người dùng mới coi như đã được tạo
  const synced = !dryRun ? mockSyncCount++ > 0 : mockSyncCount > 0
  const changes: LdapSyncChange[] = [
    ...(synced
      ? []
      : [
          { action: 'create', username: 'phamthid', fullName: 'Phạm Thị D', detail: 'phamthid@mamcg.vn' },
          { action: 'create', username: 'hoangvane', fullName: 'Hoàng Văn E', detail: 'Tài khoản đang bị khoá trên LDAP' },
        ]),
    { action: 'update', username: 'tranthib', fullName: 'Trần Thị B', detail: 'điện thoại, chức vụ' },
    { action: 'skip', username: 'admin', fullName: 'Administrator (LDAP)', detail: 'Trùng tên với tài khoản nội bộ, bỏ qua' },
    ...(config.deactivateMissingUsers
      ? [{ action: 'deactivate', username: 'nguyenvanx', fullName: 'Nguyễn Văn X', detail: 'Không còn trên LDAP' }]
      : []),
  ]
  const count = (action: string) => changes.filter((c) => c.action === action).length
  const created = count('create')
  const updated = count('update')
  const deactivated = count('deactivate')
  const skipped = count('skip')
  const found = 6
  const unchanged = found - created - updated - skipped
  const departmentsCreated = synced ? 0 : 1
  const positionsCreated = synced ? 0 : 1
  const message =
    `${dryRun ? '[Xem trước] ' : ''}Tìm thấy ${found} người dùng: tạo ${created}, cập nhật ${updated}, ` +
    `không đổi ${unchanged}, khoá ${deactivated}, bỏ qua ${skipped}` +
    (departmentsCreated + positionsCreated > 0
      ? `; phòng ban mới ${departmentsCreated}, chức vụ mới ${positionsCreated}`
      : '')
  return {
    configurationId,
    dryRun,
    success: true,
    found,
    created,
    updated,
    unchanged,
    deactivated,
    skipped,
    departmentsCreated,
    positionsCreated,
    message,
    changes,
    elapsedMs: dryRun ? 84 : 312,
  }
}

export const settingHandlers = [
  http.get(api(apiUrls.setting.list), ({ request }) => {
    const prefix = (new URL(request.url).searchParams.get('prefix') ?? '').trim().toLowerCase()
    const items = settings
      .filter((s) => s.key.toLowerCase().startsWith(prefix))
      .sort((a, b) => a.key.localeCompare(b.key))
    return HttpResponse.json(items.map(toDto))
  }),

  http.put(api(apiUrls.setting.save), async ({ request }) => {
    const items = (await request.json()) as SettingUpsertItem[]
    if (items.length === 0) return badRequest('Danh sách cấu hình trống')
    if (items.some((i) => !i.key?.trim())) return badRequest('Khoá cấu hình không được trống và tối đa 255 ký tự')
    const saved = items.map((item) => {
      const key = (item.key ?? '').trim()
      let setting = settings.find((s) => s.key.toLowerCase() === key.toLowerCase())
      if (!setting) {
        setting = { key, value: null, description: null }
        settings.push(setting)
      }
      setting.value = isSecretKey(key) ? resolveSecret(item.value, setting.value) : (item.value ?? null)
      if (item.description != null) setting.description = item.description
      return setting
    })
    return HttpResponse.json(saved.sort((a, b) => a.key.localeCompare(b.key)).map(toDto))
  }),

  // Giả lập gửi email thử bằng cấu hình đã lưu
  http.post(api(apiUrls.setting.testEmail), async ({ request }) => {
    const { to } = (await request.json()) as { to?: string }
    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      return HttpResponse.json(
        { title: 'One or more validation errors occurred.', status: 400, errors: { To: ['Email không hợp lệ'] } },
        { status: 400 }
      )
    }
    const host = valueOf('email.smtp.host')
    if (!host || !valueOf('email.from.address')) {
      return HttpResponse.json({
        success: false,
        message: 'Chưa cấu hình email.smtp.host hoặc email.from.address',
        elapsedMs: 0,
      })
    }
    return HttpResponse.json({ success: true, message: `Đã gửi email thử tới ${to}`, elapsedMs: 245 })
  }),

  http.get(api(apiUrls.ldap.list), ({ request }) => {
    const { page, totalCount } = paginate(ldapConfigs, new URL(request.url), (c) => c.serverUrl ?? '')
    return HttpResponse.json({ items: page.map(ldapDto), totalCount })
  }),

  http.get(api(apiUrls.ldap.details(id)), ({ params }) => {
    const config = ldapConfigs.find((c) => c.id === Number(params.id))
    return config ? HttpResponse.json(ldapDto(config)) : notFound()
  }),

  http.post(api(apiUrls.ldap.create), async ({ request }) => {
    const data = (await request.json()) as LdapConfigurationRequest
    const error = validateLdap(data)
    if (error) return badRequest(error)
    const created: LdapConfiguration = { id: ++ldapSeq, bindPassword: null, createdAt: now() }
    applyLdap(created, data)
    ldapConfigs.push(created)
    return HttpResponse.json(ldapDto(created))
  }),

  http.put(api(apiUrls.ldap.update(id)), async ({ params, request }) => {
    const config = ldapConfigs.find((c) => c.id === Number(params.id))
    if (!config) return notFound()
    const data = (await request.json()) as LdapConfigurationRequest
    const error = validateLdap(data)
    if (error) return badRequest(error)
    applyLdap(config, data)
    return HttpResponse.json(ldapDto(config))
  }),

  http.delete(api(apiUrls.ldap.delete(id)), ({ params }) => {
    const index = ldapConfigs.findIndex((c) => c.id === Number(params.id))
    if (index < 0) return notFound()
    ldapConfigs.splice(index, 1)
    return HttpResponse.json(true)
  }),

  // Server có "backup" trong địa chỉ giả lập không kết nối được; mật khẩu người dùng rỗng = sai
  http.post(api(apiUrls.ldap.test(id)), async ({ params, request }) => {
    const config = ldapConfigs.find((c) => c.id === Number(params.id))
    if (!config) return notFound()
    const body = (await request.json().catch(() => ({}))) as LdapTestRequest | null
    if (config.serverUrl?.includes('backup')) {
      return HttpResponse.json({ success: false, message: "Lỗi LDAP: The LDAP server is unavailable.", elapsedMs: 10012 })
    }
    const username = body?.username?.trim()
    if (!username) {
      return HttpResponse.json({ success: true, message: 'Kết nối và bind tài khoản dịch vụ thành công', elapsedMs: 18 })
    }
    const userDn = `CN=${username},OU=Users,${config.baseDn ?? ''}`
    const valid = !!body?.password
    return HttpResponse.json({
      success: valid,
      message: valid ? `Xác thực thành công: ${userDn}` : `Tìm thấy ${userDn} nhưng mật khẩu không đúng`,
      elapsedMs: 25,
    })
  }),

  // Đồng bộ người dùng: dryRun=true chỉ xem trước; server "backup" giả lập lỗi kết nối
  http.post(api(apiUrls.ldap.sync(id)), async ({ params, request }) => {
    const config = ldapConfigs.find((c) => c.id === Number(params.id))
    if (!config?.id) return notFound()
    const dryRun = new URL(request.url).searchParams.get('dryRun') === 'true'
    if (runningSyncs.has(config.id)) {
      return HttpResponse.json({ title: 'Cấu hình LDAP này đang được đồng bộ.', status: 409 }, { status: 409 })
    }
    runningSyncs.add(config.id)
    try {
      await new Promise((resolve) => setTimeout(resolve, dryRun ? 400 : 1200))
      const result = mockSync(config, dryRun)
      if (!dryRun) {
        config.lastSyncAt = now()
        config.lastSyncStatus = result.message ?? null
      }
      return HttpResponse.json(result)
    } finally {
      runningSyncs.delete(config.id)
    }
  }),

  // Xem thử người dùng LDAP theo ánh xạ thuộc tính
  http.get(api(apiUrls.ldap.users(id)), async ({ params, request }) => {
    const config = ldapConfigs.find((c) => c.id === Number(params.id))
    if (!config) return notFound()
    if (config.serverUrl?.includes('backup')) {
      return HttpResponse.json({ title: 'Lỗi LDAP: The LDAP server is unavailable.', status: 502 }, { status: 502 })
    }
    const limit = Math.min(200, Math.max(1, Number(new URL(request.url).searchParams.get('limit') ?? 20) || 20))
    await new Promise((resolve) => setTimeout(resolve, 300))
    return HttpResponse.json(ldapUsers(config).slice(0, limit))
  }),
]
