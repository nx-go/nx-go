import { ApplicationGeneratorSchema } from '../generators/application/schema'

export interface NormalizedSchema extends ApplicationGeneratorSchema {
  npmScope?: string
  projectName: string
  projectRoot: string
  projectDirectory: string
  parsedTags: string[]
  skipGoMod?: boolean
  useGoWork?: boolean
  skipVersionCheck?: boolean
}
