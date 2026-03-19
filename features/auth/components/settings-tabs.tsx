import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'
import { Fingerprint, Github, Save, SquareAsterisk } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/features/shared/components/ui/card'
import { Separator } from '@/features/shared/components/ui/separator'
import { Switch } from '@/features/shared/components/ui/switch'
import { Button } from '@/features/shared/components/ui/button'
import { Spinner } from '@/features/shared/components/ui/spinner'
import { Field, FieldLabel } from '@/features/shared/components/ui/field'
import { Input } from 'postcss'

export function SettingsTabs() {
  return (
    <Card className={'pt-0'}>
      <Tabs className={'max-w-3xl lg:w-3xl'} defaultValue={'password'}>
        <TabsList className={'w-full'}>
          <TabsTrigger value={'password'}>
            <div className={'flex items-center justify-center gap-1 px-2'}>
              <SquareAsterisk />
              <span>Passwort</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value={'microsoft'}>
            <div
              className={'flex items-center justify-center gap-1 px-1 sm:px-2'}>
              <Image
                src={'/microsoft.svg'}
                alt={'Microsoft Logo'}
                width={16}
                height={16}
                className="size-4"
              />
              <span>Microsoft</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value={'github'}>
            <div className={'flex items-center justify-center gap-1 px-2'}>
              <Github />
              <span>Github</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value={'oauth'}>
            <div className={'flex items-center justify-center gap-1 px-2'}>
              <Fingerprint />
              <span>OAuth</span>
            </div>
          </TabsTrigger>
        </TabsList>
        <CardContent>
          <TabsContent value={'password'}>
            <div className={'flex items-center justify-between'}>
              <div className={'py-2'}>
                <p className={'text-sm'}>Passwort Login erlauben</p>
                <p className={'text-muted-foreground text-xs'}>
                  Wenn aktiviert, können Sie sich mit Ihrem Passwort anmelden.
                </p>
              </div>
              <div className={'p-2'}>
                <Switch />
              </div>
            </div>
            <Separator />
            <div className={'flex items-center justify-between'}>
              <div className={'py-2'}>
                <p className={'text-sm'}>Passkey Login erlauben</p>
                <p className={'text-muted-foreground text-xs'}>
                  Wenn aktiviert, können Sie sich mit Passkeys anmelden.
                </p>
              </div>
              <div className={'p-2'}>
                <Switch />
              </div>
            </div>
          </TabsContent>
          <TabsContent value={'microsoft'}>
            <div className={'flex items-center justify-between'}>
              <div className={'py-2'}>
                <p className={'text-sm'}>Microsoft Login erlauben</p>
                <p className={'text-muted-foreground text-xs'}>
                  Ermöglicht die Anmeldung über Microsoft-Konten.
                </p>
              </div>
              <div className={'p-2'}>
                <Switch />
              </div>
            </div>
            <Separator />
            <div className={'flex items-center justify-between'}>
              <div className={'py-2'}>
                <p className={'text-sm'}>Konfiguration</p>
                <p className={'text-muted-foreground text-xs'}>
                  Ermöglicht die Anmeldung über Microsoft-Konten.
                </p>
              </div>
              <div className={'p-2'}>
                <Button variant={'outline'} size={'sm'}>
                  {false ? <Spinner /> : <Save />}
                  Speichern
                </Button>
              </div>
            </div>
            <Field className={'mt-4'}>
              <FieldLabel>Client ID</FieldLabel>
            </Field>
          </TabsContent>
          <TabsContent value={'github'}></TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
