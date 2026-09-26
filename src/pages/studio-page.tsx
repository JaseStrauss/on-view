import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { fetchArtworks, getArtworkImageUrl } from '@/services/artworks'
import type { Artwork } from '@/types/artwork'

const statusLabels: Record<Artwork['status'], string> = {
  available: 'Available',
  sold: 'Sold',
  on_loan: 'On loan',
  in_storage: 'In storage',
}

export function StudioPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArtworks()
      .then(setArtworks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl italic">Your studio</h1>
          <p className="mt-2 text-muted-foreground">
            Catalogue artworks here. Exhibitions coming in the next session.
          </p>
        </div>
        <Button render={<Link to="/studio/artworks/new" />}>
          <ImagePlus className="size-4" />
          Add artwork
        </Button>
      </div>

      {loading && (
        <p className="mt-12 text-muted-foreground">Loading artworks…</p>
      )}
      {error && <p className="mt-12 text-sm text-destructive">{error}</p>}

      {!loading && !error && artworks.length === 0 && (
        <Card className="mt-16 border-dashed">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl italic">
              No artworks yet
            </CardTitle>
            <CardDescription>
              Add your first piece to start building your catalogue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button render={<Link to="/studio/artworks/new" />}>
              <ImagePlus className="size-4" />
              Add artwork
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && artworks.length > 0 && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.map((artwork) => {
            const imageUrl = getArtworkImageUrl(artwork.image_path)

            return (
              <Card key={artwork.id} className="overflow-hidden pt-0">
                <div className="aspect-[4/5] bg-muted">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={artwork.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{artwork.title}</CardTitle>
                  {artwork.artist_name && (
                    <CardDescription>{artwork.artist_name}</CardDescription>
                  )}
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {statusLabels[artwork.status]}
                  </p>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
