interface FastApiEnv {
  DEBUG?: string,
  LLM?: string,
  OPENAI_API_KEY?: string,
  GOOGLE_API_KEY?: string,
  APP_DATA_DIRECTORY?: string,
  TEMP_DIRECTORY?: string,
  USER_CONFIG_PATH?: string,
}

interface NextJsEnv {
  NEXT_PUBLIC_FAST_API?: string,
  TEMP_DIRECTORY?: string,
  NEXT_PUBLIC_URL?: string,
  NEXT_PUBLIC_USER_CONFIG_PATH?: string,
}

interface UserConfig {
  LLM?: string,
  OPENAI_API_KEY?: string,
  GOOGLE_API_KEY?: string,
}

interface IPCStatus {
  success: boolean,
  message?: string,
}