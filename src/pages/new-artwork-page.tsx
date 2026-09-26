import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import {
  AddToExhibitionFields,
  getDefaultAddToExhibitionValue,
  type AddToExhibitionValue,
} from '@/components/add-to-exhibition-fields'
import { useExhibitions } from '@/hooks/use-exhibitions'
import { finishArtworkWithOptionalCatalogue } from '@/lib/artwork-exhibition-flow'
import { showDemoOnlyToast } from '@/lib/public-demo'
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
import { DemoStudioBanner } from '@/components/demo-studio-banner'
import { PageBackLink } from '@/components/page-back-link'
import {
  ARTWORK_STATUS_OPTIONS,
  formatArtworkStatus,
} from '@/lib/artwork-form'
import { createArtwork } from '@/services/artworks'
import type { ArtworkFormData, ArtworkStatus } from '@/types/artwork'

const initialForm: ArtworkFormData = {
  title: '',
  artist: '',
  year: '',
  medium: '',
  width_cm: '',
  height_cm: '',
  status: 'available',
  description: '',
  condition_notes: '',
}

interface NewArtworkPageProps {
  demoMode?: boolean
}

export function NewArtworkPage({ demoMode = false }: NewArtworkPageProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialExhibitionId = searchParams.get('exhibition')
  const { exhibitions, loading: exhibitionsLoading } = useExhibitions(user?.id)
  const [form, setForm] = useState<ArtworkFormData>(initialForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [addToExhibition, setAddToExhibition] = useState<AddToExhibitionValue>({
    enabled: false,
    exhibitionId: '',
  })

  useEffect(() => {
    if (exhibitions.length === 0) return
    setAddToExhibition((current) => {
      if (current.exhibitionId) return current
      return getDefaultAddToExhibitionValue(exhibitions, initialExhibitionId)
    })
  }, [exhibitions, initialExhibitionId])

  function updateField<K extends keyof ArtworkFormData>(
    key: K,
    value: ArtworkFormData[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (demoMode) {
      showDemoOnlyToast()
      return
    }
    if (!user) return

    setSubmitting(true)
    setError(null)

    try {
      const artwork = await createArtwork(user.id, form, imageFile)
      await finishArtworkWithOptionalCatalogue(
        artwork,
        addToExhibition,
        navigate,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save artwork')
      setSubmitting(false)
    }
  }

  const backTo = initialExhibitionId
    ? `/studio/exhibitions/${initialExhibitionId}`
    : demoMode
      ? '/studio/demo'
      : '/studio'
  const backLabel = initialExhibitionId ? 'Exhibition' : 'Exhibitions'

  return (
    <>
      {demoMode && <DemoStudioBanner />}

      <div className="mx-auto max-w-2xl px-6 py-12">
        <PageBackLink to={backTo} className="mb-4">
          {backLabel}
        </PageBackLink>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-4xl italic">Add artwork</CardTitle>
            <CardDescription>
              Record the details you&apos;d keep in a catalogue or condition report.{' '}
              {demoMode ? (
                <>
                  You can also{' '}
                  <Link to="/studio/demo/artworks/bulk" className="underline">
                    upload many images
                  </Link>{' '}
                  or{' '}
                  <Link to="/studio/demo/artworks/bulk" className="underline">
                    import a CSV
                  </Link>
                  .
                </>
              ) : (
                <>
                  <Link to="/studio/artworks/bulk" className="underline">
                    Upload many images
                  </Link>{' '}
                  or{' '}
                  <Link to="/studio/artworks/bulk" className="underline">
                    import a CSV
                  </Link>{' '}
                  instead.
                </>
              )}
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
                  value={form.artist}
                  onChange={(e) => updateField('artist', e.target.value)}
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    value={form.width_cm}
                    onChange={(e) => updateField('width_cm', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={form.height_cm}
                    onChange={(e) => updateField('height_cm', e.target.value)}
                  />
                </div>
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
                    <SelectValue>{formatArtworkStatus(form.status)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ARTWORK_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="A short note for visitors and collectors…"
                  rows={4}
                />
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

              {!demoMode && (
                <AddToExhibitionFields
                  exhibitions={exhibitions}
                  loading={exhibitionsLoading}
                  value={addToExhibition}
                  onChange={setAddToExhibition}
                />
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting && !demoMode}>
                  {demoMode ? 'Save artwork (demo)' : submitting ? 'Saving…' : 'Save artwork'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(demoMode ? '/studio/demo' : '/studio')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
