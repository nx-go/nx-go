import { JsonObject } from '@angular-devkit/core'

export interface TestBuilderSchema extends JsonObject {
  skipCover?: boolean
  skipRace?: boolean
}
