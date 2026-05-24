import { View, FlatList, StyleSheet, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useNotesContext } from '@/context/NotesContext'
import { useSearch } from '@/hooks/useSearch'
import { NoteCard } from '@/components/notes/NoteCard'
import { SearchBar } from '@/components/ui/SearchBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { FAB } from '@/components/ui/FAB'
import { NoteCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { useTheme } from '@/context/ThemeContext'
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '@/constants/theme'

export default function NotesScreen() {
  const { colors, theme, toggle } = useTheme()
  const { activeNotes, deleteNote, archiveNote, togglePin, isLoaded } = useNotesContext()
  const router = useRouter()
  const [query, setQuery] = useState('')

  const results = useSearch(activeNotes, query)

  const pinned = results.filter((n) => n.isPinned)
  const unpinned = results.filter((n) => !n.isPinned)
  const sorted = [...pinned, ...unpinned]

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
          <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8} style={styles.headerBtn}>
            <Text style={{ fontSize: 20 }}>👤</Text>
          </Pressable>
        </View>
      </View>

      <SearchBar value={query} onChangeText={setQuery} />

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
})
