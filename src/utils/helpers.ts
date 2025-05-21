export function getEnv(key: string): string {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is not defined.`)
  }
  return process.env[key]
}
