export interface BuildExecutorSchema {
  outputPath?: string
  main?: string
  env?: { [key as string]: string }
  flags?: string[]
}
