import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
        For artists & small galleries
      </p>
      <h1 className="font-serif text-5xl leading-tight italic md:text-6xl">
        Catalogue artworks.
        <br />
        Curate exhibitions.
        <br />
        Share them online.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
        On View helps you manage your collection and publish beautiful, shareable
        virtual exhibitions — built by someone who&apos;s worked in galleries.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button size="lg" render={<Link to="/signup" />}>
          Start your studio
          <ArrowRight className="size-4" />
        </Button>
        <Button variant="ghost" render={<Link to="/login" />}>
          Already have an account? Sign in
        </Button>
      </div>
    </section>
  )
}
