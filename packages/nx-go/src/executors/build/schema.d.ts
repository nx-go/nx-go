export interface BuildExecutorSchema {
  cmd?: string
  outputPath?: string
  main?: string
  env?: { [key as string]: string }
  flags?: string[]
}
