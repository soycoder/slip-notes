import * as FileSystem from 'expo-file-system'
import { supabase } from './supabaseClient'

const BUCKET = 'slip-images'

export async function uploadSlipImage(
  localUri: string,
  userId: string,
  noteId: string
): Promise<string | null> {
  try {
    const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${userId}/${noteId}.${ext}`

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: `image/${ext}`, upsert: true })

    if (error) return null

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  } catch {
    return null
  }
}

export async function getSignedSlipUrl(
  userId: string,
  noteId: string,
  ext = 'jpg'
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(`${userId}/${noteId}.${ext}`, 3600)
  if (error) return null
  return data.signedUrl
}

export async function cacheSlipLocally(
  remoteUrl: string,
  noteId: string
): Promise<string> {
  const localPath = `${FileSystem.documentDirectory}slips/${noteId}.jpg`
  const dir = `${FileSystem.documentDirectory}slips/`
  const info = await FileSystem.getInfoAsync(dir)
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true })

  const cached = await FileSystem.getInfoAsync(localPath)
  if (cached.exists) return localPath

  const { uri } = await FileSystem.downloadAsync(remoteUrl, localPath)
  return uri
}
