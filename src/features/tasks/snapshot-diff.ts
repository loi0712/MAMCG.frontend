// So sánh hai snapshot JSON của nội dung (tài sản / cảnh CG) theo từng trường.

export type DiffKind = 'changed' | 'added' | 'removed' | 'same'

export interface DiffRow {
  path: string
  before: string | undefined
  after: string | undefined
  kind: DiffKind
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

// Nhãn tiếng Việt cho các khoá hay gặp trong snapshot
const LABELS: Record<string, string> = {
  id: 'Id',
  name: 'Tên',
  code: 'Mã',
  filepath: 'Đường dẫn file',
  extension: 'Định dạng',
  size: 'Dung lượng',
  isapproved: 'Đã duyệt',
  createdat: 'Ngày tạo',
  modifiedat: 'Ngày sửa',
  scenetemplate: 'Mẫu cảnh',
  scenefields: 'Trường',
  scenepath: 'Đường dẫn cảnh',
  jsoncontent: 'Nội dung cảnh',
  value: 'Giá trị',
}

// Bỏ các khoá không mang nghĩa khi so sánh (cấu hình kiểu dữ liệu, thứ tự hiển thị...)
const SKIP = new Set(['datatype', 'datasource', 'visibilityrules', 'editable', 'isrequired', 'description'])

const label = (key: string) => LABELS[key.toLowerCase()] ?? key
// Lấy giá trị theo thứ tự ưu tiên của keys (không phân biệt hoa thường)
const get = (o: Record<string, Json>, ...keys: string[]) => {
  for (const key of keys) {
    const found = Object.keys(o).find((k) => k.toLowerCase() === key)
    if (found !== undefined) return o[found]
  }
  return undefined
}

const scalar = (v: Json): string => (v === null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v))

// Tên phần tử mảng: ưu tiên tên hiển thị của panel/trường, sau đó tới id
const itemLabel = (item: Json, index: number) => {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const named = get(item, 'panelname', 'displayname', 'fieldname', 'name', 'code')
    if (typeof named === 'string' && named) return named
    const id = get(item, 'fieldid', 'id')
    if (id !== undefined && id !== null) return `#${id}`
  }
  return `[${index + 1}]`
}

function flatten(node: Json, path: string, out: Map<string, string>) {
  if (node === null || typeof node !== 'object') {
    out.set(path || 'Giá trị', scalar(node))
    return
  }
  if (Array.isArray(node)) {
    if (node.length === 0) out.set(path, '')
    node.forEach((item, i) => flatten(item, path ? `${path} › ${itemLabel(item, i)}` : itemLabel(item, i), out))
    return
  }
  // Trường dữ liệu dạng { DisplayName/FieldName, Value }: một dòng theo tên trường
  const value = get(node, 'value')
  const fieldName = get(node, 'displayname', 'fieldname', 'fieldid')
  if (value !== undefined && fieldName !== undefined && (value === null || typeof value !== 'object')) {
    out.set(path, scalar(value))
    return
  }
  for (const [key, child] of Object.entries(node)) {
    if (SKIP.has(key.toLowerCase())) continue
    // Tên panel/trường đã nằm trong đường dẫn
    if (path && ['panelname', 'displayname', 'fieldname'].includes(key.toLowerCase())) continue
    // Panels là khung chứa, không cần hiện trong đường dẫn
    const segment = key.toLowerCase() === 'panels' || key.toLowerCase() === 'fields' ? '' : label(key)
    flatten(child, [path, segment].filter(Boolean).join(' › '), out)
  }
}

export function parseSnapshot(snapshot: string | null | undefined): Map<string, string> | null {
  if (!snapshot?.trim()) return new Map()
  try {
    const out = new Map<string, string>()
    flatten(JSON.parse(snapshot) as Json, '', out)
    return out
  } catch {
    return null
  }
}

export function diffSnapshots(before: Map<string, string>, after: Map<string, string>): DiffRow[] {
  const paths = [...new Set([...before.keys(), ...after.keys()])]
  return paths.map((path) => {
    const a = before.get(path)
    const b = after.get(path)
    const kind: DiffKind = a === undefined ? 'added' : b === undefined ? 'removed' : a === b ? 'same' : 'changed'
    return { path, before: a, after: b, kind }
  })
}
