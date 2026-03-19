import { SettingsTabs } from '@/features/auth/components/settings-tabs'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  return (
    <div className={'flex w-full items-center justify-center'}>
      <SettingsTabs />
    </div>
  )
}
