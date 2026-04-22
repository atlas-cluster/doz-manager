export type AiSettingsData = {
  enabled: boolean
  baseUrl: string
  model: string
  timeoutMs: number
  hasApiKey: boolean
}

export type AiConnectionTestResult = {
  success: boolean
  latencyMs: number
  tokensPerSecond?: number
  totalTokens?: number
  completionTokens?: number
  promptTokens?: number
  modelInfo?: string
  responseText?: string
  error?: string
}
