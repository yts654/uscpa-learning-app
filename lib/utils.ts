import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Brighten an HSL color for dark mode visibility */
export function brightenForDark(hslColor: string, isDark: boolean): string {
  if (!isDark) return hslColor
  const match = hslColor.match(/hsl\((\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?\)/)
  if (!match) return hslColor
  const [, h, s, l] = match
  const newL = Math.min(75, parseInt(l) + 30)
  return `hsl(${h}, ${s}%, ${newL}%)`
}
