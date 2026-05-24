import { View, FlatList, StyleSheet, Text, Pressable, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useNotesContext } from '@/context/NotesContext'
import { useSearch } from '@/hooks/useSearch'
import { NoteCard } from '@/components/notes/NoteCard'
import { SearchBar } from '@/components/ui/SearchBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { FAB } from '@/components/ui/FAB'
import { NoteCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { useTheme } from '@/context/ThemeContext'
import { SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '@/constants/theme'
import type { SortOrder } from '@/types/note'

const SORT_OPTIONS: { key: SortOrder; label: string }[] = [
  { key: 'updated', label: 'Updated' },
  { key: 'created', label: 'Created' },
  { key: 'title', label: 'Title' },
]

export default function NotesScreen() {
  const { colors, theme, toggle } = useTheme()
  const { activeNotes, deleteNote, archiveNote, togglePin, isLoaded } = useNotesContext()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('updated')
  const [activeTag, setActiveTag] = useState('')

  const allTags = useMemo(() => {
    const set = new Set<string>()
    activeNotes.forEach((n) => n.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [activeNotes])

  const tagFiltered = useMemo(
    () => (activeTag ? activeNotes.filter((n) => n.tags.includes(activeTag)) : activeNotes),
    [activeNotes, activeTag]
  )

  const results = useSearch(tagFiltered, query)

  const sorted = useMemo(() => {
    const pinned = results.filter((n) => n.isPinned)
    const unpinned = results.filter((n) => !n.isPinned)
    const compareFn = (a: typeof results[0], b: typeof results[0]) => {
      if (sortOrder === 'title') return a.title.localeCompare(b.title)
      if (sortOrder === 'created') return b.createdAt.localeCompare(a.createdAt)
      return b.updatedAt.localeCompare(a.updatedAt)
    }
    return [...pinned.sort(compareFn), ...unpinned.sort(compareFn)]
  }, [results, sortOrder])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.logo, { color: colors.textPrimary }]}>SlipNotes</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={() => router.push('/slip/capture')} hitSlop={8} style={styles.headerBtn}>
            <Text style={{ fontSize: 20 }}>📷</Text>
          </Pressable>
          <Pressable onPress={toggle} hitSlop={8} style={styles.headerBtn}>
            <Text style={{ fontSize: 20 }}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/settings')} hitSlop={8} style={styles.headerBtn}>
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      <SearchBar value={query} onChangeText={setQuery} />

      {/* Sort controls */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[
                styles.sortChip,
                { borderColor: colors.border, backgroundColor: sortOrder === opt.key ? colors.accent : colors.bgSurface },
              ]}
              onPress={() => setSortOrder(opt.key)}
            >
              <Text style={[styles.sortChipText, { color: sortOrder === opt.key ? '#fff' : colors.textSecondary }]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
          {allTags.length > 0 && <View style={styles.divider} />}
          {allTags.map((tag) => (
            <Pressable
              key={tag}
              style={[
                styles.sortChip,
                { borderColor: colors.border, backgroundColor: activeTag === tag ? colors.accentLight : colors.bgSurface },
              ]}
              onPress={() => setActiveTag(activeTag === tag ? '' : tag)}
            >
              <Text style={[styles.sortChipText, { color: activeTag === tag ? colors.accent : colors.textSecondary }]}>
                #{tag}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {!isLoaded ? (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => <NoteCardSkeleton key={i} />)}
        </View>
      ) : sorted.length === 0 ? (
        <EmptyState
          emoji="📝"
          title={query ? 'No notes match your search' : 'No notes yet'}
          subtitle={query ? 'Try a different search term' : 'Tap + to create your first note'}
        />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onDelete={deleteNote}
              onArchive={archiveNote}
              onTogglePin={togglePin}
              searchQuery={query}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB onPress={() => router.push('/note/new')} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  headerRight: { flexDirection: 'row', gap: SPACING.sm },
  headerBtn: { padding: SPACING.xs },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  sortScroll: { flexGrow: 0 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  sortChip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  sortChipText: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium },
  divider: { width: 1, height: 20, backgroundColor: '#E5E7EB', marginHorizontal: SPACING.xs },
})
