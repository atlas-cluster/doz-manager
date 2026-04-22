import { requireAdmin } from '@/features/access-control/lib/require-admin'
import { getAuthSettings } from '@/features/auth/actions/get-auth-settings'
import { getProviderUserCounts } from '@/features/auth/actions/get-provider-user-counts'
import { SettingsTabs } from '@/features/auth/components/settings-tabs'
import { getAiSettings } from '@/features/chat/actions/get-ai-settings'
import { AiSettingsCard } from '@/features/chat/components/ai-settings-card'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  await requireAdmin()

  const [settings, userCounts, aiSettings] = await Promise.all([
    getAuthSettings(),
    getProviderUserCounts(),
    getAiSettings(),
  ])

  const baseUrl = process.env.BETTER_AUTH_URL ?? ''

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <SettingsTabs
        initialSettings={settings}
        userCounts={userCounts}
        baseUrl={baseUrl}
      />
      <AiSettingsCard initialSettings={aiSettings} />
    </div>
  )
}
