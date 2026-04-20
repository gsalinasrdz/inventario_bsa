import { cn } from '@/lib/utils'

interface Props {
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ fullScreen, size = 'md', className }: Props) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  }

  const spinner = (
    <div className={cn(
      'animate-spin rounded-full border-primary border-t-transparent',
      sizes[size],
      className
    )} />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}
