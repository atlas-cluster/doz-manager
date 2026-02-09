import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initialsFromName(name?: string, maxLetters = 2) {
  if (!name) return '?'

  // Normalize + split
  const parts = name.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean)

  if (parts.length === 0) return '?'

  // Single word: take first 2 letters (e.g., "Jeremy" => "JE")
  if (parts.length === 1) {
    const word = parts[0]
    return Array.from(word).slice(0, maxLetters).join('').toUpperCase()
  }

  // Multiple words: take first char of first + last (e.g., "Jeremy Doe" => "JD")
  const first = Array.from(parts[0])[0] ?? '?'
  const last = Array.from(parts[parts.length - 1])[0] ?? '?'
  return `${first}${last}`.toUpperCase()
}
