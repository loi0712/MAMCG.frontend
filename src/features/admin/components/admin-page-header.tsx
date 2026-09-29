type AdminPageHeaderProps = {
  title: string
  subtitle?: string
}

export function AdminPageHeader({ title, subtitle }: AdminPageHeaderProps) {
  return (
    <div className='bg-card border-b px-6 py-4'>
      <h1 className='text-primary text-lg font-semibold'>{title}</h1>
      {subtitle && (
        <p className='text-muted-foreground mt-1 text-sm'>{subtitle}</p>
      )}
    </div>
  )
}
