import { View, FlatList, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useNotes } from '@/hooks/useNotes'
import { useSearch } from '@/hooks/useSearch'
import { NoteCard } from '@/components/notes/NoteCard'
import { SearchBar } from '@/components/ui/SearchBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTheme } from '@/context/ThemeContext'
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '@/constants/theme'

export default function ArchiveScreen() {
  const { colors } = useTheme()
  const { archivedNotes, deleteNote, unarchiveNote } = useNotes()
  const [query, setQuery] = useState('')
  const results = useSearch(archivedNotes, query)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Archive</Text>
      </View>
      <SearchBar value={query} onChangeText={setQuery} />
      {results.length === 0 ? (
        <EmptyState emoji="📦" title="Archive is empty" subtitle="Archived notes appear here" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onDelete={deleteNote}
              onUnarchive={unarchiveNote}
              searchQuery={query}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
})
