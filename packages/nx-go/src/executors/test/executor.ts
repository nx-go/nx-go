import { ExecutorContext } from '@nrwl/devkit'
import { runGoCommand } from '../../utils'
import { TestExecutorSchema } from './schema'

export default async function runExecutor(options: TestExecutorSchema, context: ExecutorContext) {
  const projectName = context?.projectName
  const sourceRoot = context?.workspace?.projects[projectName]?.root
  const cwd = `${sourceRoot}`

  // strict equality with false used for backward compatibility
  // verbose output should be the default
  const verboseOutput = options.verbose === false ? '' : '-v'

  const tags = options.tags ? `-tags=${options.tags.join(',')}` : ''
  const sources = options.packages && options.packages.length > 0 ? `${options.packages.join(' ')}` : `./...`
  const cover = options.skipCover ? '' : '-cover'
  const race = options.skipRace ? '' : '-race'

  return runGoCommand(context, 'test', [verboseOutput, tags, sources, cover, race], { cwd })
}
