import { ExecutorContext } from '@nrwl/devkit'
import { runGoCommand } from '../../utils'
import { BuildExecutorSchema } from './schema'

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
  const mainFile = `${options.main}`
  const output = `-o ${options.outputPath}${process.platform === 'win32' ? '.exe' : ''}`
  const params: string[] = []
  if (options.outputPath) {
    params.push(output)
  }
  if (options.flags) {
    params.push(...options.flags)
  }
  if (options.main) {
    params.push(mainFile)
  }

  const commandOptions = options.env ? { env: options.env } : undefined

  return runGoCommand(context, 'build', params, commandOptions)
}
