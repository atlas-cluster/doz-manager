import { requireAdmin } from '@/features/access-control/lib/require-admin'
import { getAuthSettings } from '@/features/auth/actions/get-auth-settings'
import { getProviderUserCounts } from '@/features/auth/actions/get-provider-user-counts'
import { SettingsTabs } from '@/features/auth/components/settings-tabs'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  await requireAdmin()

  const [settings, userCounts] = await Promise.all([
    getAuthSettings(),
    getProviderUserCounts(),
  ])

  const baseUrl = process.env.BETTER_AUTH_URL ?? ''

  return (
    <div className={'flex w-full items-center justify-center'}>
      <SettingsTabs
        initialSettings={settings}
        userCounts={userCounts}
        baseUrl={baseUrl}
      />
    </div>
  )
}
