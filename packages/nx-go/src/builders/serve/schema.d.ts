import { JsonObject } from '@angular-devkit/core'

export interface ServeBuilderSchema extends JsonObject {
  cmd: string
  main: string
  outputPath: string
}
