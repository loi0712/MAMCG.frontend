// Giá trị Type lưu ở backend (chuỗi tự do)
export const STORAGE_TYPES = [
  { value: 'Local', label: 'Ổ đĩa cục bộ', cloud: false },
  { value: 'NAS', label: 'NAS (Network Attached Storage)', cloud: false },
  { value: 'SAN', label: 'SAN (Storage Area Network)', cloud: false },
  { value: 'FTP', label: 'FTP/SFTP Server', cloud: false },
  { value: 'S3', label: 'Amazon S3', cloud: true },
  { value: 'Wasabi', label: 'Wasabi Cloud Storage', cloud: true },
  { value: 'Azure Blob', label: 'Azure Blob Storage', cloud: true },
  { value: 'Google Cloud', label: 'Google Cloud Storage', cloud: true },
]

export const isCloudType = (type: string | null | undefined) =>
  STORAGE_TYPES.some((t) => t.cloud && t.value.toLowerCase() === (type ?? '').toLowerCase())
