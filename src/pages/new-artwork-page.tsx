import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import {
  AddToExhibitionFields,
  getDefaultAddToExhibitionValue,
  type AddToExhibitionValue,
} from '@/components/add-to-exhibition-fields'
import { useExhibitions } from '@/hooks/use-exhibitions'
import { toast } from 'sonner'
import { completeArtworkSave } from '@/lib/artwork/exhibition-flow'
import { addDemoSandboxCustomArtwork } from '@/lib/demo/sandbox-artworks'
import { getArtworkFlowPaths } from '@/lib/demo/studio-routes'
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
  assertArtworkFormValid,
  ARTWORK_STATUS_OPTIONS,
  formatArtworkStatus,
} from '@/lib/artwork/form'
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
  const paths = useMemo(
    () => getArtworkFlowPaths(demoMode, initialExhibitionId),
    [demoMode, initialExhibitionId],
  )
  const { exhibitions, loading: exhibitionsLoading } = useExhibitions(user?.id)
  const [form, setForm] = useState<ArtworkFormData>(initialForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
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

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  function updateField<K extends keyof ArtworkFormData>(
    key: K,
    value: ArtworkFormData[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    try {
      assertArtworkFormValid(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save artwork')
      return
    }

    if (demoMode) {
      setSubmitting(true)
      setError(null)
      try {
        if (!imageFile) {
          setError(
            'Add an image so the work appears in your catalogue and on walls.',
          )
          return
        }
        await addDemoSandboxCustomArtwork(form, imageFile)
        toast.success('Added to your demo catalogue')
        navigate(paths.backTo)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save artwork')
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (!user) return

    setSubmitting(true)
    setError(null)

    try {
      const artwork = await createArtwork(user.id, form, imageFile)
      await completeArtworkSave(
        artwork,
        addToExhibition,
        navigate,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save artwork')
      setSubmitting(false)
    }
  }

  return (
    <>
      {demoMode && <DemoStudioBanner />}

      <div className="mx-auto max-w-2xl px-6 py-12">
        <PageBackLink to={paths.backTo} className="mb-4">
          {paths.backLabel}
        </PageBackLink>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-4xl italic">Add artwork</CardTitle>
            <CardDescription>
              Record the details you&apos;d keep in a catalogue or condition report.{' '}
              {demoMode ? (
                <>
                  You can also{' '}
                  <Link to={paths.bulkImportPath} className="underline">
                    upload many images
                  </Link>{' '}
                  or{' '}
                  <Link to={paths.bulkImportPath} className="underline">
                    import a CSV
                  </Link>
                  .
                </>
              ) : (
                <>
                  <Link to={paths.bulkImportPath} className="underline">
                    Upload many images
                  </Link>{' '}
                  or{' '}
                  <Link to={paths.bulkImportPath} className="underline">
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
                <Label htmlFor="title" requiredMark className="gap-1">
                  Title
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  required
                  aria-required="true"
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

              <div className="space-y-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="width" requiredMark className="gap-1">
                      Width (cm)
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.width_cm}
                      onChange={(e) => updateField('width_cm', e.target.value)}
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" requiredMark className="gap-1">
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.height_cm}
                      onChange={(e) => updateField('height_cm', e.target.value)}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Physical size on the wall. Match the work (or photo aspect) so
                  the wall plan and 3D preview stay aligned.
                </p>
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
                {imagePreviewUrl && imageFile && (
                  <div className="overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={imagePreviewUrl}
                      alt={
                        form.title.trim()
                          ? `Preview of ${form.title.trim()}`
                          : `Preview of ${imageFile.name}`
                      }
                      className="mx-auto max-h-64 w-full object-contain"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Optional to save, but strongly recommended so the work shows in
                  your catalogue and on walls.
                </p>
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
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save artwork'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(paths.cancelPath)}
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
