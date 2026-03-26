'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

import { Button } from '@/features/shared/components/ui/button'

type GlobalErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="de">
      <body>
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            <h2 className="mb-6 text-5xl font-semibold">500</h2>
            <h3 className="mb-1.5 text-3xl font-semibold">
              Anwendung momentan nicht verfuegbar
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Es ist ein kritischer Fehler aufgetreten. Bitte laden Sie die
              Seite neu oder kehren Sie zur Startseite zurueck.
            </p>

            {error.digest ? (
              <p className="text-muted-foreground mb-6 text-xs">
                Fehler-ID: {error.digest}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                onClick={reset}
                size="lg"
                className="rounded-lg text-base">
                Neu laden
              </Button>

              <Button
                type="button"
                variant="outline"
                asChild
                size="lg"
                className="rounded-lg text-base">
                <Link href="/lecturers">Zurück zur Startseite</Link>
              </Button>
            </div>
          </div>

          <div className="relative max-h-screen w-full p-2 max-lg:hidden">
            <div className="h-full w-full rounded-2xl bg-black"></div>
            <Image
              src="/bg.png"
              fill
              priority
              sizes="(min-width: 768px) 100vw"
              quality={75}
              alt="Fehlerillustration"
              className="rounded-2xl object-cover"
            />
          </div>
        </div>
      </body>
    </html>
  )
}
