// Giá trị Type lưu ở backend (chuỗi tự do); backend chỉ kiểm tra kết nối được SqlServer
export const DATABASE_TYPES = [
  { value: 'SqlServer', label: 'MS SQL Server', template: 'Server=192.168.1.50,1433;Database=mamcg;User Id=sa;Password=...;TrustServerCertificate=true;' },
  { value: 'PostgreSQL', label: 'PostgreSQL', template: 'Host=192.168.1.50;Port=5432;Database=mamcg;Username=postgres;Password=...;' },
  { value: 'MySQL', label: 'MySQL', template: 'Server=192.168.1.50;Port=3306;Database=mamcg;Uid=root;Pwd=...;' },
  { value: 'MariaDB', label: 'MariaDB', template: 'Server=192.168.1.50;Port=3306;Database=mamcg;Uid=root;Pwd=...;' },
  { value: 'Oracle', label: 'Oracle', template: 'Data Source=192.168.1.50:1521/ORCL;User Id=system;Password=...;' },
  { value: 'MongoDB', label: 'MongoDB', template: 'mongodb://user:password@192.168.1.50:27017/mamcg' },
]
