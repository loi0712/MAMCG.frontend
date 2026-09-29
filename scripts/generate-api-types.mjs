/**
 * Sinh kiểu TypeScript từ OpenAPI (Swagger) của MAMCG.Backend.
 *
 *   yarn api:types              Tải spec từ backend, lưu openapi/mamcg-api.json rồi sinh kiểu
 *   yarn api:types <url|file>   Dùng nguồn spec chỉ định (URL hoặc đường dẫn file)
 *   yarn api:types:check        Sinh lại từ openapi/mamcg-api.json, báo lỗi nếu file kiểu bị lệch
 *
 * Nguồn mặc định: $OPENAPI_URL, nếu không có thì `${VITE_API_URL}/swagger/v1/swagger.json`
 * (VITE_API_URL đọc từ .env.development / .env).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import openapiTS, { astToString } from 'openapi-typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SPEC_FILE = path.join(root, 'openapi/mamcg-api.json')
const TYPES_FILE = path.join(root, 'src/api/generated/schema.ts')

const HEADER = `/**
 * FILE SINH TỰ ĐỘNG – KHÔNG SỬA TAY.
 * Nguồn: openapi/mamcg-api.json (Swagger của MAMCG.Backend).
 * Cập nhật: yarn api:types
 */

`

async function readSpec(source) {
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source)
    if (!res.ok) throw new Error(`Không tải được spec (${res.status}) từ ${source}`)
    return res.json()
  }
  return JSON.parse(await fs.readFile(path.resolve(source), 'utf8'))
}

function defaultSource() {
  if (process.env.OPENAPI_URL) return process.env.OPENAPI_URL
  const { VITE_API_URL } = loadEnv('development', root, '')
  if (!VITE_API_URL) {
    throw new Error('Chưa có nguồn spec: đặt OPENAPI_URL hoặc VITE_API_URL, hoặc truyền URL/file.')
  }
  return `${VITE_API_URL.replace(/\/+$/, '')}/swagger/v1/swagger.json`
}

async function generateTypes(spec) {
  const ast = await openapiTS(spec, { alphabetize: true })
  return HEADER + astToString(ast)
}

async function main() {
  const [arg] = process.argv.slice(2)

  if (arg === '--check') {
    const hasSpec = await fs.access(SPEC_FILE).then(() => true, () => false)
    if (!hasSpec) {
      console.log('Chưa có openapi/mamcg-api.json, bỏ qua kiểm tra. Chạy yarn api:types để tạo.')
      return
    }
    const spec = await readSpec(SPEC_FILE)
    const expected = await generateTypes(spec)
    const actual = await fs.readFile(TYPES_FILE, 'utf8').catch(() => '')
    if (expected !== actual) {
      console.error('src/api/generated/schema.ts không khớp với openapi/mamcg-api.json. Chạy: yarn api:types openapi/mamcg-api.json')
      process.exit(1)
    }
    console.log('Kiểu API khớp với spec.')
    return
  }

  const source = arg ?? defaultSource()
  console.log(`Đọc spec từ ${source}`)
  const spec = await readSpec(source)

  await fs.mkdir(path.dirname(SPEC_FILE), { recursive: true })
  await fs.mkdir(path.dirname(TYPES_FILE), { recursive: true })
  if (path.resolve(source) !== SPEC_FILE) {
    await fs.writeFile(SPEC_FILE, JSON.stringify(spec, null, 2) + '\n')
  }
  await fs.writeFile(TYPES_FILE, await generateTypes(spec))

  console.log(`Đã ghi ${path.relative(root, SPEC_FILE)} và ${path.relative(root, TYPES_FILE)}`)
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
