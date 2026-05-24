import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { useNotes } from '@/hooks/useNotes'
import { ColorPicker } from '@/components/notes/ColorPicker'
import { TagChip } from '@/components/notes/TagChip'
import { useTheme } from '@/context/ThemeContext'
import type { NoteColor } from '@/types/note'
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/constants/theme'

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const { notes, updateNote, deleteNote } = useNotes()
  const router = useRouter()

  const note = notes.find((n) => n.id === id)
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [color, setColor] = useState<NoteColor>(note?.color ?? 'default')
  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setColor(note.color)
      setTags(note.tags)
    }
  }, [id])

  if (!note) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
        <Text style={[styles.titleInput, { color: colors.textMuted }]}>Note not found</Text>
      </SafeAreaView>
    )
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/^#/, '')
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  function handleSave() {
    updateNote(id, { title: title.trim(), content: content.trim(), color, tags })
    Toast.show({ type: 'success', text1: 'Note updated' })
    router.back()
  }

  function handleDelete() {
    Alert.alert('Delete Note', 'Move this note to trash?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteNote(id)
          Toast.show({ type: 'info', text1: 'Moved to trash' })
          router.back()
        },
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={[styles.cancelBtn, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable onPress={handleDelete} hitSlop={8} style={styles.deleteBtn}>
              <Text style={{ fontSize: 18, color: colors.danger }}>🗑</Text>
            </Pressable>
            <Pressable onPress={handleSave} hitSlop={8}>
              <Text style={[styles.saveBtn, { color: colors.accent }]}>Save</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[styles.titleInput, { color: colors.textPrimary }]}
            placeholder="Title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.contentInput, { color: colors.textPrimary }]}
            placeholder="Write something…"
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
          <ColorPicker value={color} onChange={setColor} />
          <View style={styles.tagSection}>
            <View style={styles.tagsRow}>
              {tags.map((t) => (
                <TagChip key={t} label={t} onRemove={() => setTags(tags.filter((x) => x !== t))} />
              ))}
            </View>
            <TextInput
              style={[styles.tagInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgSurface }]}
              placeholder="Add tag…"
              placeholderTextColor={colors.textMuted}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              blurOnSubmit={false}
              returnKeyType="done"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  cancelBtn: { fontSize: FONT_SIZE.md },
  deleteBtn: { padding: 4 },
  saveBtn: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold },
  titleInput: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  contentInput: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    minHeight: 200,
  },
  tagSection: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm },
  tagInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xl,
  },
})
