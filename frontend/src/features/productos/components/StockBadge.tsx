import { cn, getStockBadgeColor, getStockLabel } from '@/lib/utils'

interface Props {
  stockActual: number | null
  stockMinimo: number
  showCount?: boolean
}

export default function StockBadge({ stockActual, stockMinimo, showCount = true }: Props) {
  const cantidad = stockActual ?? 0

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
      getStockBadgeColor(cantidad, stockMinimo)
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {showCount && <span>{cantidad}</span>}
      <span>{getStockLabel(cantidad, stockMinimo)}</span>
    </span>
  )
}
