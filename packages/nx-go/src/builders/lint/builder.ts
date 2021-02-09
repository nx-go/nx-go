import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { runGoCommand } from '../../utils/go-utils'
import { LintBuilderSchema } from './schema'

export function runBuilder(options: LintBuilderSchema, context: BuilderContext): Observable<BuilderOutput> {
  return from(context.getProjectMetadata(context?.target?.project)).pipe(
    map((project) => {
      const cwd = `${project.root}`
      const sources = `./...`

      return runGoCommand(context, 'fmt', [sources], { cwd })
    }),
  )
}

export default createBuilder(runBuilder)
