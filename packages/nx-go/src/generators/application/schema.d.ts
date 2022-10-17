export interface ApplicationGeneratorSchema {
  name: string
  tags?: string
  directory?: string
  skipGoMod?: boolean
  useGoWork?: boolean
  skipVersionCheck?: boolean
}
