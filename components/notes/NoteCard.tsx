import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { useRef } from 'react'
import type { Note } from '@/types/note'
import { NOTE_COLORS } from '@/constants/colors'
import { TagChip } from './TagChip'
import { useTheme } from '@/context/ThemeContext'
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '@/constants/theme'

interface Props {
  note: Note
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
  onUnarchive?: (id: string) => void
  onTogglePin?: (id: string) => void
  onRestore?: (id: string) => void
  isTrash?: boolean
  searchQuery?: string
}

export function NoteCard({
  note,
  onDelete,
  onArchive,
  onUnarchive,
  onTogglePin,
  onRestore,
  isTrash = false,
}: Props) {
  const { theme, colors } = useTheme()
  const router = useRouter()
  const swipeRef = useRef<Swipeable>(null)
  const noteColor = NOTE_COLORS[note.color]?.[theme] ?? NOTE_COLORS.default[theme]

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    } catch {
      return ''
    }
  })()

  function handlePress() {
    if (!isTrash) {
      router.push(`/note/${note.id}`)
    }
  }

  function renderRightActions() {
    if (isTrash) {
      return (
        <View style={styles.swipeActions}>
          <Pressable
            style={[styles.swipeAction, { backgroundColor: colors.accent }]}
            onPress={() => { swipeRef.current?.close(); onRestore?.(note.id) }}
          >
            <Text style={styles.swipeActionText}>↩{'\n'}Restore</Text>
          </Pressable>
          <Pressable
            style={[styles.swipeAction, { backgroundColor: colors.danger }]}
            onPress={() => { swipeRef.current?.close(); onDelete?.(note.id) }}
          >
            <Text style={styles.swipeActionText}>🗑{'\n'}Delete</Text>
          </Pressable>
        </View>
      )
    }
    return (
      <View style={styles.swipeActions}>
        <Pressable
          style={[styles.swipeAction, { backgroundColor: colors.border }]}
          onPress={() => {
            swipeRef.current?.close()
            note.isArchived ? onUnarchive?.(note.id) : onArchive?.(note.id)
          }}
        >
          <Text style={styles.swipeActionText}>{note.isArchived ? '📤' : '📦'}{'\n'}{note.isArchived ? 'Unarchive' : 'Archive'}</Text>
        </Pressable>
        <Pressable
          style={[styles.swipeAction, { backgroundColor: colors.danger }]}
          onPress={() => { swipeRef.current?.close(); onDelete?.(note.id) }}
        >
          <Text style={styles.swipeActionText}>🗑{'\n'}Delete</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} overshootRight={false} friction={2}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.card,
          SHADOW.sm,
          {
            backgroundColor: noteColor.bg,
            borderColor: noteColor.border,
          },
        ]}
      >
        {note.isPinned && <Text style={styles.pin}>📌</Text>}

        {note.title ? (
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
            {note.title}
          </Text>
        ) : null}

        {note.content ? (
          <Text style={[styles.content, { color: colors.textSecondary }]} numberOfLines={8}>
            {note.content}
          </Text>
        ) : null}

        {note.type === 'slip' && note.slipData && (
          <View style={[styles.slipBadge, { backgroundColor: colors.accentLight }]}>
            <Text style={[styles.slipAmount, { color: colors.accent }]}>
              ฿{note.slipData.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.slipBank, { color: colors.textSecondary }]}>
              → {note.slipData.recipientBank}
            </Text>
          </View>
        )}

        {note.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {note.tags.slice(0, 3).map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
            {note.tags.length > 3 && (
              <Text style={[styles.moreTags, { color: colors.textMuted }]}>+{note.tags.length - 3}</Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.time, { color: colors.textMuted }]}>{timeAgo}</Text>
          <View style={styles.actions}>
            {!isTrash && (
              <ActionBtn
                label={note.isPinned ? '📌' : '📍'}
                onPress={() => onTogglePin?.(note.id)}
                color={colors.textMuted}
              />
            )}
          </View>
        </View>
      </Pressable>
    </Swipeable>
  )
}

function ActionBtn({ label, onPress, color }: { label: string; onPress: () => void; color: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.actionBtn}>
      <Text style={{ fontSize: 16, color }}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  pin: { fontSize: 12, position: 'absolute', top: SPACING.sm, right: SPACING.sm },
  title: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, marginBottom: SPACING.xs },
  content: { fontSize: FONT_SIZE.sm, lineHeight: 20, marginBottom: SPACING.sm },
  slipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  slipAmount: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold },
  slipBank: { fontSize: FONT_SIZE.sm },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm },
  moreTags: { fontSize: FONT_SIZE.xs, alignSelf: 'center', marginLeft: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xs },
  time: { fontSize: FONT_SIZE.xs },
  actions: { flexDirection: 'row', gap: SPACING.xs },
  actionBtn: { padding: 4 },
  swipeActions: { flexDirection: 'row', marginBottom: SPACING.md },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: RADIUS.lg,
    marginLeft: SPACING.xs,
  },
  swipeActionText: { fontSize: FONT_SIZE.xs, color: '#fff', textAlign: 'center', fontWeight: FONT_WEIGHT.medium },
})
