import { type ReactNode, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className={`relative bg-surface-container-lowest rounded-xl shadow-ambient ${sizeClasses[size]} w-full`}>
          {title && (
            <div className="flex items-center justify-between p-4">
              <h3 className="text-lg font-semibold font-display text-primary">{title}</h3>
              <button
                onClick={onClose}
                className="text-legal-400 hover:text-legal-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
