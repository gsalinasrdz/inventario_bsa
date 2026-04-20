import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style:    'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function getStockBadgeColor(stockActual: number, stockMinimo: number): string {
  if (stockActual === 0) return 'bg-red-100 text-red-700 border-red-200'
  if (stockActual <= stockMinimo) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

export function getStockLabel(stockActual: number, stockMinimo: number): string {
  if (stockActual === 0) return 'Sin Stock'
  if (stockActual <= stockMinimo) return 'Stock Bajo'
  return 'En Stock'
}
