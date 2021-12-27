import { ApplicationGeneratorSchema } from '../generators/application/schema'

export interface NormalizedSchema extends ApplicationGeneratorSchema {
  npmScope?: boolean
  projectName: string
  projectRoot: string
  projectDirectory: string
  parsedTags: string[]
  skipGoMod?: boolean
}
