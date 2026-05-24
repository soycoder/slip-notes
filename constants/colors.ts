import type { NoteColor } from '@/types/note'

export const LIGHT = {
  bgPrimary: '#FAFAF8',
  bgSurface: '#FFFFFF',
  bgElevated: '#F5F5F2',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  accent: '#3B82F6',
  accentLight: '#EFF6FF',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  success: '#10B981',
  warning: '#F59E0B',
}

export const DARK = {
  bgPrimary: '#1A1A1A',
  bgSurface: '#242424',
  bgElevated: '#2E2E2E',
  textPrimary: '#F5F5F2',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#3A3A3A',
  accent: '#60A5FA',
  accentLight: '#1E3A5F',
  danger: '#F87171',
  dangerLight: '#3B1F1F',
  success: '#34D399',
  warning: '#FBBF24',
}

export interface NoteColorValue {
  light: { bg: string; border: string }
  dark: { bg: string; border: string }
  label: string
}

export const NOTE_COLORS: Record<NoteColor, NoteColorValue> = {
  default: { light: { bg: '#FFFFFF', border: '#E5E7EB' }, dark: { bg: '#242424', border: '#3A3A3A' }, label: 'Default' },
  coral:   { light: { bg: '#FFF0EE', border: '#FECACA' }, dark: { bg: '#3B1F1E', border: '#7F1D1D' }, label: 'Coral' },
  peach:   { light: { bg: '#FFF6ED', border: '#FED7AA' }, dark: { bg: '#3B2A1A', border: '#78350F' }, label: 'Peach' },
  sage:    { light: { bg: '#F0F7F0', border: '#BBF7D0' }, dark: { bg: '#1A2E1A', border: '#14532D' }, label: 'Sage' },
  mint:    { light: { bg: '#ECFDF5', border: '#A7F3D0' }, dark: { bg: '#1A2E24', border: '#065F46' }, label: 'Mint' },
  lavender:{ light: { bg: '#F5F3FF', border: '#DDD6FE' }, dark: { bg: '#1E1B33', border: '#4C1D95' }, label: 'Lavender' },
  pink:    { light: { bg: '#FFF0F6', border: '#FBCFE8' }, dark: { bg: '#2E1A27', border: '#831843' }, label: 'Pink' },
  sky:     { light: { bg: '#F0F9FF', border: '#BAE6FD' }, dark: { bg: '#1A2A33', border: '#075985' }, label: 'Sky' },
  stone:   { light: { bg: '#F8F7F4', border: '#D6D3D1' }, dark: { bg: '#292524', border: '#57534E' }, label: 'Stone' },
  rose:    { light: { bg: '#FFF1F2', border: '#FECDD3' }, dark: { bg: '#2E1A1C', border: '#9F1239' }, label: 'Rose' },
}
