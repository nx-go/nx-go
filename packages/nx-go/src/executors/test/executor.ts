import { ExecutorContext } from '@nrwl/devkit'
import { runGoCommand } from '../../utils'
import { TestExecutorSchema } from './schema'

export default async function runExecutor(options: TestExecutorSchema, context: ExecutorContext) {
  const projectName = context?.projectName
  const sourceRoot = context?.workspace?.projects[projectName]?.root
  const cwd = `${sourceRoot}`
  const sources = `-v ./...`
  const cover = options.skipCover ? '' : '-cover'
  const race = options.skipRace ? '' : '-race'

  return runGoCommand(context, 'test', [sources, cover, race], { cwd })
}
