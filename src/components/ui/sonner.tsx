import { Toaster as Sonner, ToasterProps } from 'sonner'
import { useTheme } from '@/context/Theme-provider'

export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-center" // Move to top center for better visibility
      expand={true} // Expand toasts by default for more attention
      visibleToasts={5} // Show more toasts at once
      closeButton={true} // Add close button for better UX
      richColors={true} // Use rich colors for different toast types
      duration={6000} // Longer duration for more attention (6 seconds)
      className='toaster group [&_div[data-content]]:w-full'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--z-index': '9999', // Ensure it's on top of other elements
        } as React.CSSProperties
      }
      toastOptions={{
        // Default styling for all toasts to make them more noticeable
        className: 'border-2 shadow-lg backdrop-blur-sm',
        style: {
          fontSize: '14px',
          fontWeight: '500',
        }
      }}
      {...props}
    />
  )
}
