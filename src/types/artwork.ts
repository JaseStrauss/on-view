export type ArtworkStatus = 'available' | 'sold' | 'on_loan' | 'in_storage'

export interface Artwork {
  id: string
  user_id: string
  title: string
  artist_name: string | null
  year: number | null
  medium: string | null
  dimensions: string | null
  status: ArtworkStatus
  condition_notes: string | null
  image_path: string | null
  created_at: string
}

export interface ArtworkFormData {
  title: string
  artist_name: string
  year: string
  medium: string
  dimensions: string
  status: ArtworkStatus
  condition_notes: string
}
