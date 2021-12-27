import { ExecutorContext } from '@nrwl/devkit'
import { runGoCommand } from '../../utils'
import { LintExecutorSchema } from './schema'

export default async function runExecutor(options: LintExecutorSchema, context: ExecutorContext) {
  const projectName = context?.projectName
  const sourceRoot = context?.workspace?.projects[projectName]?.root
  const cwd = `${sourceRoot}`
  const sources = `./...`

  return runGoCommand(context, 'fmt', [sources], { cwd })
}
