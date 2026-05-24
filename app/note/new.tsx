import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { useNotes } from '@/hooks/useNotes'
import { ColorPicker } from '@/components/notes/ColorPicker'
import { TagChip } from '@/components/notes/TagChip'
import { useTheme } from '@/context/ThemeContext'
import type { NoteColor } from '@/types/note'
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/constants/theme'

export default function NewNoteScreen() {
  const { colors } = useTheme()
  const { createNote } = useNotes()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState<NoteColor>('default')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/^#/, '')
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  function handleSave() {
    if (!title.trim() && !content.trim()) {
      router.back()
      return
    }
    createNote({ title: title.trim(), content: content.trim(), color, tags })
    Toast.show({ type: 'success', text1: 'Note saved' })
    router.back()
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={[styles.cancelBtn, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Pressable onPress={handleSave} hitSlop={8}>
            <Text style={[styles.saveBtn, { color: colors.accent }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[styles.titleInput, { color: colors.textPrimary }]}
            placeholder="Title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            autoFocus
          />
          <TextInput
            style={[styles.contentInput, { color: colors.textPrimary }]}
            placeholder="Start writing…"
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
              placeholder="Add tag… (press return)"
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
  cancelBtn: { fontSize: FONT_SIZE.md },
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
