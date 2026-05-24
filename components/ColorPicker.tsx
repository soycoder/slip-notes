import { NoteColor } from '@/types/note'

const COLORS: { key: NoteColor; bg: string; label: string }[] = [
  { key: 'default',  bg: '#FFFFFF', label: 'Default' },
  { key: 'coral',    bg: '#FFDDD2', label: 'Coral' },
  { key: 'peach',    bg: '#FFF3CD', label: 'Peach' },
  { key: 'sage',     bg: '#D4EDDA', label: 'Sage' },
  { key: 'mint',     bg: '#D1ECF1', label: 'Mint' },
  { key: 'lavender', bg: '#E2D9F3', label: 'Lavender' },
  { key: 'pink',     bg: '#FCE4EC', label: 'Pink' },
  { key: 'sky',      bg: '#DBEAFE', label: 'Sky' },
  { key: 'stone',    bg: '#F0EDE8', label: 'Stone' },
  { key: 'rose',     bg: '#FFE4E1', label: 'Rose' },
]

interface Props {
  value: NoteColor
  onChange: (color: NoteColor) => void
}

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '4px 0' }}>
      {COLORS.map((c) => (
        <button
          key={c.key}
          title={c.label}
          onClick={() => onChange(c.key)}
          className={`color-dot ${value === c.key ? 'selected' : ''}`}
          style={{
            background: c.bg,
            border: c.key === 'default' ? '1.5px solid #D1D5DB' : '1.5px solid transparent',
          }}
        />
      ))}
    </div>
  )
}

export { COLORS }
