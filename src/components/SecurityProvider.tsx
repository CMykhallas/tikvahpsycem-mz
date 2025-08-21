
import { useEffect } from 'react'

interface SecurityProviderProps {
  children: React.ReactNode
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  useEffect(() => {
    // Set security-related meta tags
    const setSecurityHeaders = () => {
      // Content Security Policy - Enhanced for production
      const cspMeta = document.createElement('meta')
      cspMeta.httpEquiv = 'Content-Security-Policy'
      cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://rccfbawvirzdarzblirj.supabase.co wss://rccfbawvirzdarzblirj.supabase.co; font-src 'self' data:; object-src 'none'; media-src 'self'; frame-src 'self' https://lovable.app https://*.lovable.app;"
      document.head.appendChild(cspMeta)

      // X-Content-Type-Options
      const noSniffMeta = document.createElement('meta')
      noSniffMeta.httpEquiv = 'X-Content-Type-Options'
      noSniffMeta.content = 'nosniff'
      document.head.appendChild(noSniffMeta)

      // X-Frame-Options - Allow iframe for Lovable development
      const frameOptionsMeta = document.createElement('meta')
      frameOptionsMeta.httpEquiv = 'X-Frame-Options'
      frameOptionsMeta.content = 'SAMEORIGIN'
      document.head.appendChild(frameOptionsMeta)

      // Referrer Policy
      const referrerMeta = document.createElement('meta')
      referrerMeta.name = 'referrer'
      referrerMeta.content = 'strict-origin-when-cross-origin'
      document.head.appendChild(referrerMeta)

      // Strict Transport Security
      const stsMeta = document.createElement('meta')
      stsMeta.httpEquiv = 'Strict-Transport-Security'
      stsMeta.content = 'max-age=31536000; includeSubDomains'
      document.head.appendChild(stsMeta)
    }

    setSecurityHeaders()

    // Security event listeners
    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu in development
      if (import.meta.env.DEV) return
      e.preventDefault()
    }

    const handleDragStart = (e: DragEvent) => {
      // Prevent dragging of sensitive elements
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' || target.hasAttribute('data-sensitive')) {
        e.preventDefault()
      }
    }

    // Add keyboard shortcut protection in production
    const handleKeyDown = (e: KeyboardEvent) => {
      if (import.meta.env.DEV) return
      
      // Prevent F12, Ctrl+Shift+I, Ctrl+U in production
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return <>{children}</>
}
