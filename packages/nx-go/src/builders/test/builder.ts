import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { TestBuilderSchema } from './schema'
import { runGoCommand } from '../../utils/go-utils'

export function runBuilder(options: TestBuilderSchema, context: BuilderContext): Observable<BuilderOutput> {
  return from(context.getProjectMetadata(context?.target?.project)).pipe(
    map((project) => {
      const cwd = `${project.root}`
      const sources = `-v ./...`
      const cover = options.skipCover ? '' : '-cover'
      const race = options.skipRace ? '' : '-race'

      return runGoCommand(context, 'test', [sources, cover, race], { cwd })
    }),
  )
}

export default createBuilder(runBuilder)
