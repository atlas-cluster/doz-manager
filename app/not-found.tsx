import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/features/shared/components/ui/button'

export default function NotFound() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <h2 className="mb-6 text-5xl font-semibold">404</h2>
        <h3 className="mb-1.5 text-3xl font-semibold">Seite nicht gefunden</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Die Seite, die Sie suchen, existiert nicht oder wurde verschoben.
        </p>
        <Button asChild size="lg" className="rounded-lg text-base">
          <Link href="/lecturers">Zurück zur Startseite</Link>
        </Button>
      </div>

      {/* Right Section: Illustration */}
      <div className="relative max-h-screen w-full p-2 max-lg:hidden">
        <div className="h-full w-full rounded-2xl bg-black"></div>
        <Image
          src="/bg.png"
          fill
          priority
          sizes="(min-width: 768px) 100vw"
          quality={75}
          alt="404 illustration"
          className="rounded-2xl object-cover"
        />
      </div>
    </div>
  )
}
