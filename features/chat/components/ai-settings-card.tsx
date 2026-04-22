'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  BotIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  GaugeIcon,
  HashIcon,
  MessageSquareTextIcon,
  RefreshCwIcon,
  Save,
  XCircleIcon,
  ZapIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type z from 'zod'

import { fetchAvailableModels } from '@/features/chat/actions/fetch-available-models'
import { saveAiSettings } from '@/features/chat/actions/save-ai-settings'
import { testAiConnection } from '@/features/chat/actions/test-ai-connection'
import { aiSettingsSchema } from '@/features/chat/schemas/ai-settings'
import type {
  AiConnectionTestResult,
  AiSettingsData,
} from '@/features/chat/types'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { Card, CardContent } from '@/features/shared/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select'
import { Separator } from '@/features/shared/components/ui/separator'
import { Spinner } from '@/features/shared/components/ui/spinner'
import { Switch } from '@/features/shared/components/ui/switch'
import { cn } from '@/features/shared/lib/utils'

const SECRET_PLACEHOLDER = '••••••••••••••••'

type AiSettingsCardProps = {
  initialSettings: AiSettingsData
}

export function AiSettingsCard({ initialSettings }: AiSettingsCardProps) {
  const router = useRouter()
  const [chatEnabled, setChatEnabled] = useState(initialSettings.enabled)
  const [isSavingToggle, setIsSavingToggle] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [testResult, setTestResult] = useState<AiConnectionTestResult | null>(
    null
  )
  const [availableModels, setAvailableModels] = useState<
    Array<{ id: string; owned_by?: string }>
  >([])
  const [modelsLoaded, setModelsLoaded] = useState(false)

  const form = useForm<z.infer<typeof aiSettingsSchema>>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      baseUrl: initialSettings.baseUrl,
      apiKey: '',
      model: initialSettings.model,
      timeoutMs: initialSettings.timeoutMs,
    },
  })

  const hasChanges = form.formState.isDirty

  async function handleToggleEnabled(enabled: boolean) {
    setChatEnabled(enabled)
    setIsSavingToggle(true)
    try {
      const values = form.getValues()
      await saveAiSettings({
        enabled,
        baseUrl: values.baseUrl,
        apiKey: values.apiKey || undefined,
        model: values.model,
        timeoutMs: values.timeoutMs,
      })
      toast.success(enabled ? 'Chatbot aktiviert' : 'Chatbot deaktiviert')
      router.refresh()
    } catch (e) {
      setChatEnabled(!enabled)
      toast.error(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally {
      setIsSavingToggle(false)
    }
  }

  async function handleSave(data: z.infer<typeof aiSettingsSchema>) {
    setIsSaving(true)
    try {
      await saveAiSettings({
        enabled: chatEnabled,
        baseUrl: data.baseUrl,
        apiKey: data.apiKey || undefined,
        model: data.model,
        timeoutMs: data.timeoutMs,
      })
      toast.success('KI-Einstellungen gespeichert')
      form.reset({
        baseUrl: data.baseUrl,
        apiKey: '',
        model: data.model,
        timeoutMs: data.timeoutMs,
      })
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Fehler beim Speichern der KI-Einstellungen'
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTest() {
    const values = form.getValues()
    const baseUrl = values.baseUrl
    const apiKey = values.apiKey
    const model = values.model

    if (!baseUrl || !model) {
      toast.error('Bitte Base URL und Modell ausfüllen.')
      return
    }

    if (!apiKey && !initialSettings.hasApiKey) {
      toast.error('Bitte einen API Key eingeben.')
      return
    }

    setIsTesting(true)
    setTestResult(null)
    try {
      const result = await testAiConnection({
        baseUrl,
        apiKey: apiKey || '__use_existing__',
        model,
      })
      setTestResult(result)
      if (result.success) {
        toast.success('Verbindung erfolgreich')
      } else {
        toast.error(result.error ?? 'Verbindungstest fehlgeschlagen')
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Fehler beim Verbindungstest'
      )
    } finally {
      setIsTesting(false)
    }
  }

  async function handleLoadModels() {
    const values = form.getValues()
    const baseUrl = values.baseUrl
    const apiKey = values.apiKey

    if (!baseUrl) {
      toast.error('Bitte zuerst eine Base URL eingeben.')
      return
    }

    if (!apiKey && !initialSettings.hasApiKey) {
      toast.error('Bitte einen API Key eingeben.')
      return
    }

    setIsLoadingModels(true)
    try {
      const result = await fetchAvailableModels({
        baseUrl,
        apiKey: apiKey || '__use_existing__',
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        setAvailableModels(result.models)
        setModelsLoaded(true)
        if (result.models.length === 0) {
          toast.info('Keine Modelle vom Server zurückgegeben.')
        }
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Fehler beim Laden der Modelle'
      )
    } finally {
      setIsLoadingModels(false)
    }
  }

  return (
    <Card className="pt-0">
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <BotIcon className="text-muted-foreground size-5" />
        <h2 className="text-base font-semibold">KI-Assistent</h2>
      </div>
      <CardContent className="max-w-3xl lg:w-3xl">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm">Chatbot aktivieren</p>
            <p className="text-muted-foreground text-xs">
              Wenn deaktiviert, ist der Chat-Assistent für alle Benutzer
              ausgeblendet.
            </p>
          </div>
          <div className="p-2">
            {isSavingToggle ? (
              <Spinner />
            ) : (
              <Switch
                checked={chatEnabled}
                onCheckedChange={handleToggleEnabled}
              />
            )}
          </div>
        </div>

        <Separator />

        <button
          type="button"
          className="flex w-full items-center justify-between py-3"
          onClick={() => setSettingsOpen(!settingsOpen)}>
          <span className="text-sm font-medium">Verbindungseinstellungen</span>
          <ChevronDownIcon
            className={cn(
              'text-muted-foreground size-4 transition-transform',
              settingsOpen && 'rotate-180'
            )}
          />
        </button>

        {settingsOpen && (
          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="space-y-4 pb-2">
            <FieldGroup>
              <Controller
                name="baseUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ai-baseUrl">
                      OpenAI-kompatible Base URL
                    </FieldLabel>
                    <Input
                      id="ai-baseUrl"
                      placeholder="https://api.openai.com/v1"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="apiKey"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ai-apiKey" className="gap-1">
                      API Key
                      {initialSettings.hasApiKey && (
                        <span className="text-muted-foreground text-xs font-normal">
                          (gespeichert)
                        </span>
                      )}
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="ai-apiKey"
                        type={showApiKey ? 'text' : 'password'}
                        placeholder={
                          initialSettings.hasApiKey
                            ? SECRET_PLACEHOLDER
                            : 'Ihr API Key'
                        }
                        className="pr-9"
                        {...field}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      <Button
                        className="absolute top-0 right-0 h-full px-3 hover:!bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                        size="icon"
                        type="button"
                        variant="ghost">
                        {showApiKey ? (
                          <EyeOffIcon className="text-muted-foreground" />
                        ) : (
                          <EyeIcon className="text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="model"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ai-model">Modell</FieldLabel>
                    <div className="flex gap-2">
                      {modelsLoaded && availableModels.length > 0 ? (
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v)
                          }}>
                          <SelectTrigger className="w-full" id="ai-model">
                            <SelectValue placeholder="Modell auswählen…" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="ai-model"
                          placeholder="gpt-4o, llama3, qwen3.5:9b, ..."
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                        />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={handleLoadModels}
                        disabled={isLoadingModels}
                        title="Verfügbare Modelle laden">
                        {isLoadingModels ? (
                          <Spinner />
                        ) : (
                          <RefreshCwIcon className="size-4" />
                        )}
                      </Button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="timeoutMs"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ai-timeoutMs">
                      Timeout (Millisekunden)
                    </FieldLabel>
                    <Input
                      id="ai-timeoutMs"
                      type="number"
                      min={1000}
                      max={600000}
                      step={1000}
                      placeholder="60000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Separator />

            {testResult && (
              <div
                className={`rounded-lg border p-4 ${
                  testResult.success
                    ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                    : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                }`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2Icon className="size-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircleIcon className="size-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="font-medium">
                    {testResult.success
                      ? 'Verbindung erfolgreich'
                      : 'Verbindung fehlgeschlagen'}
                  </span>
                </div>
                {testResult.responseText && (
                  <div className="bg-background/50 mt-3 rounded-md border p-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <MessageSquareTextIcon className="text-muted-foreground size-3.5" />
                      <span className="text-muted-foreground text-xs font-medium">
                        Antwort
                      </span>
                    </div>
                    <p className="text-sm">{testResult.responseText}</p>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <ClockIcon className="size-3" />
                    {testResult.latencyMs} ms
                  </Badge>
                  {testResult.tokensPerSecond !== undefined && (
                    <Badge variant="secondary" className="gap-1">
                      <ZapIcon className="size-3" />
                      {testResult.tokensPerSecond} tk/s
                    </Badge>
                  )}
                  {testResult.completionTokens !== undefined && (
                    <Badge variant="secondary" className="gap-1">
                      <HashIcon className="size-3" />
                      {testResult.completionTokens} Completion-Tokens
                    </Badge>
                  )}
                  {testResult.promptTokens !== undefined && (
                    <Badge variant="secondary" className="gap-1">
                      <HashIcon className="size-3" />
                      {testResult.promptTokens} Prompt-Tokens
                    </Badge>
                  )}
                  {testResult.totalTokens !== undefined && (
                    <Badge variant="secondary" className="gap-1">
                      <GaugeIcon className="size-3" />
                      {testResult.totalTokens} Total-Tokens
                    </Badge>
                  )}
                  {testResult.modelInfo && (
                    <Badge variant="secondary" className="gap-1">
                      <BotIcon className="size-3" />
                      {testResult.modelInfo}
                    </Badge>
                  )}
                </div>
                {testResult.error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {testResult.error}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isTesting}>
                {isTesting ? <Spinner /> : <GaugeIcon />}
                Verbindung testen
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || !hasChanges}>
                {isSaving ? <Spinner /> : <Save />}
                Speichern
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
