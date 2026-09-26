import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface ArtworkImageProps {
  src: string | null
  alt: string
  className?: string
}

export function ArtworkImage({ src, alt, className = '' }: ArtworkImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground ${className}`}
      >
        <ImageOff className="size-8 opacity-50" />
        <span className="px-4 text-center text-xs">Image unavailable</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
