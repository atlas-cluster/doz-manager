import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/logo.png"
          alt="Provadis Logo"
          width={120}
          height={120}
          priority
          className="animate-pulse"
        />
        <h1 className="text-6xl font-bold">404</h1>
        <span className="text-muted-foreground">Page not found</span>
      </div>
    </div>
  )
}
