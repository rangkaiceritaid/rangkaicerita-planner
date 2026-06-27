import { differenceInDays, differenceInMonths, differenceInWeeks, format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns'
import { id } from 'date-fns/locale'

export function getDaysUntilWedding(weddingDate: string | Date): number {
  const date = typeof weddingDate === 'string' ? new Date(weddingDate) : weddingDate
  return Math.max(0, differenceInDays(date, new Date()))
}

export function getCountdownBreakdown(weddingDate: string | Date) {
  const date = typeof weddingDate === 'string' ? new Date(weddingDate) : weddingDate
  const now = new Date()
  const totalDays = Math.max(0, differenceInDays(date, now))
  const months = Math.floor(totalDays / 30)
  const weeks = Math.floor((totalDays % 30) / 7)
  const days = totalDays

  return { totalDays, months, weeks, days }
}

export function formatWeddingDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "EEEE, d MMMM yyyy", { locale: id })
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "d MMM yyyy", { locale: id })
}

export function formatTaskDueDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return 'Hari ini'
  if (isTomorrow(d)) return 'Besok'
  if (isPast(d)) return `Terlambat ${formatDistanceToNow(d, { locale: id })}`
  return formatDistanceToNow(d, { addSuffix: true, locale: id })
}
