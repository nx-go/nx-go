export interface TestExecutorSchema {
  skipCover?: boolean
  skipRace?: boolean
  verbose?: boolean
  packages?: string[]
  tags?: string[]
}
