import { ARTWORK_IMAGE_BUCKET, supabase } from '@/lib/supabase'
import type { Artwork, ArtworkFormData } from '@/types/artwork'

export async function fetchArtworks(): Promise<Artwork[]> {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createArtwork(
  userId: string,
  form: ArtworkFormData,
  imageFile?: File | null,
): Promise<void> {
  let imagePath: string | null = null

  if (imageFile) {
    const extension = imageFile.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from(ARTWORK_IMAGE_BUCKET)
      .upload(path, imageFile)

    if (uploadError) throw uploadError
    imagePath = path
  }

  const { error } = await supabase.from('artworks').insert({
    user_id: userId,
    title: form.title,
    artist_name: form.artist_name || null,
    year: form.year ? Number(form.year) : null,
    medium: form.medium || null,
    dimensions: form.dimensions || null,
    status: form.status,
    condition_notes: form.condition_notes || null,
    image_path: imagePath,
  })

  if (error) throw error
}

export function getArtworkImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null

  const { data } = supabase.storage
    .from(ARTWORK_IMAGE_BUCKET)
    .getPublicUrl(imagePath)

  return data.publicUrl
}
