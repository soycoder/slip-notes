import { View, FlatList, StyleSheet, Text, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNotes } from '@/hooks/useNotes'
import { NoteCard } from '@/components/notes/NoteCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTheme } from '@/context/ThemeContext'
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '@/constants/theme'

export default function TrashScreen() {
  const { colors } = useTheme()
  const { trashedNotes, deleteFromTrash, restoreFromTrash, emptyTrash } = useNotes()

  function confirmEmptyTrash() {
    Alert.alert(
      'Empty Trash',
      'Permanently delete all trashed notes? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: emptyTrash },
      ]
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Trash</Text>
        {trashedNotes.length > 0 && (
          <Pressable onPress={confirmEmptyTrash} hitSlop={8}>
            <Text style={[styles.emptyBtn, { color: colors.danger }]}>Empty</Text>
          </Pressable>
        )}
      </View>

      {trashedNotes.length === 0 ? (
        <EmptyState emoji="🗑️" title="Trash is empty" subtitle="Deleted notes appear here for 30 days" />
      ) : (
        <FlatList
          data={trashedNotes}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onDelete={deleteFromTrash}
              onRestore={restoreFromTrash}
              isTrash
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  emptyBtn: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
})
