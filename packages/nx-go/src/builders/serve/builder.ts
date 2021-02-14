import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { runGoCommand } from '../../utils/go-utils'
import { ServeBuilderSchema } from './schema'

export function runBuilder(options: ServeBuilderSchema, context: BuilderContext): Observable<BuilderOutput> {
  return from(context.getProjectMetadata(context?.target?.project)).pipe(
    map((project) => {
      const cwd = `${options.cwd || project.root}`
      // We strip the project root from the main file
      const mainFile = options.main?.replace(`${cwd}/`, '')

      return runGoCommand(context, 'run', [mainFile], { cmd: options.cmd, cwd })
    }),
  )
}

export default createBuilder(runBuilder)
