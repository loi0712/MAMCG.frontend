import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import {
  type LdapConfiguration,
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
    createdAt: now(),
    modifiedAt: now(),
  },
]

const ldapDto = (c: LdapConfiguration): LdapConfiguration => ({ ...c, bindPassword: mask(c.bindPassword ?? null) })

const applyLdap = (target: LdapConfiguration, data: LdapConfigurationRequest) => {
  Object.assign(target, {
    serverUrl: data.serverUrl.trim(),
    baseDn: data.baseDn?.trim() ?? null,
    bindDn: data.bindDn?.trim() ?? null,
    bindPassword: resolveSecret(data.bindPassword, target.bindPassword ?? null),
    useSsl: data.useSsl ?? false,
    filterUsers: data.filterUsers?.trim() ?? null,
    filterGroups: data.filterGroups?.trim() ?? null,
    isActive: data.isActive ?? true,
    modifiedAt: now(),
  })
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
    if (!data.serverUrl?.trim()) return badRequest('ServerUrl là bắt buộc')
    const created: LdapConfiguration = { id: ++ldapSeq, bindPassword: null, createdAt: now() }
    applyLdap(created, data)
    ldapConfigs.push(created)
    return HttpResponse.json(ldapDto(created))
  }),

  http.put(api(apiUrls.ldap.update(id)), async ({ params, request }) => {
    const config = ldapConfigs.find((c) => c.id === Number(params.id))
    if (!config) return notFound()
    const data = (await request.json()) as LdapConfigurationRequest
    if (!data.serverUrl?.trim()) return badRequest('ServerUrl là bắt buộc')
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
]
