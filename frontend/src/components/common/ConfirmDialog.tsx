import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open:       boolean
  title:      string
  description: string
  confirmLabel?: string
  cancelLabel?:  string
  variant?:   'danger' | 'warning'
  isLoading?: boolean
  onConfirm:  () => void
  onCancel:   () => void
}

export default function ConfirmDialog({
  open, title, description,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  variant      = 'danger',
  isLoading,
  onConfirm, onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4',
          variant === 'danger'  ? 'bg-red-100'    : 'bg-yellow-100'
        )}>
          <AlertTriangle className={cn(
            'w-6 h-6',
            variant === 'danger' ? 'text-red-600' : 'text-yellow-600'
          )} />
        </div>
        <h3 className="text-center font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-center text-sm text-muted-foreground mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'flex-1 px-4 py-2 text-sm rounded-lg text-white font-medium transition-colors',
              variant === 'danger'
                ? 'bg-destructive hover:bg-destructive/90'
                : 'bg-yellow-500 hover:bg-yellow-600',
              isLoading && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
