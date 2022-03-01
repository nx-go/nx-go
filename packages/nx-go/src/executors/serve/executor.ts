import { ExecutorContext } from '@nrwl/devkit'
import { runGoCommand } from '../../utils'
import { ServeExecutorSchema } from './schema'

export default async function runExecutor(options: ServeExecutorSchema, context: ExecutorContext) {
  const projectName = context?.projectName
  const sourceRoot = context?.workspace?.projects[projectName]?.root
  const cwd = `${options.cwd || sourceRoot}`

  // We strip the project root from the main file
  const mainFile = options.main?.replace(`${cwd}/`, '')

  return runGoCommand(context, 'run', [mainFile, ...options.arguments], { cmd: options.cmd, cwd })
}
