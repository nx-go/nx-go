export interface BuildExecutorSchema {
  outputPath: string
  main: string
  flags: string[]
  env: string[]
}
