import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createArtwork } from '@/services/artworks'
import type { ArtworkFormData, ArtworkStatus } from '@/types/artwork'

const statusOptions: { value: ArtworkStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
  { value: 'on_loan', label: 'On loan' },
  { value: 'in_storage', label: 'In storage' },
]

const initialForm: ArtworkFormData = {
  title: '',
  artist_name: '',
  year: '',
  medium: '',
  dimensions: '',
  status: 'available',
  condition_notes: '',
}

export function NewArtworkPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<ArtworkFormData>(initialForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField<K extends keyof ArtworkFormData>(
    key: K,
    value: ArtworkFormData[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return

    setSubmitting(true)
    setError(null)

    try {
      await createArtwork(user.id, form, imageFile)
      navigate('/studio')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save artwork')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-4xl italic">Add artwork</CardTitle>
          <CardDescription>
            Record the details you&apos;d keep in a catalogue or condition report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                value={form.artist_name}
                onChange={(e) => updateField('artist_name', e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={form.year}
                  onChange={(e) => updateField('year', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medium">Medium</Label>
                <Input
                  id="medium"
                  value={form.medium}
                  onChange={(e) => updateField('medium', e.target.value)}
                  placeholder="Oil on canvas"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={form.dimensions}
                onChange={(e) => updateField('dimensions', e.target.value)}
                placeholder="60 × 80 cm"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  updateField('status', value as ArtworkStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition-notes">Condition notes (private)</Label>
              <Textarea
                id="condition-notes"
                value={form.condition_notes}
                onChange={(e) => updateField('condition_notes', e.target.value)}
                placeholder="Surface scratches along left edge…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save artwork'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/studio')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
