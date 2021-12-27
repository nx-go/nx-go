import { ExecutorContext } from '@nrwl/devkit'
import { runGoCommand } from '../../utils'
import { BuildExecutorSchema } from './schema'

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
  const mainFile = `${options.main}`
  const output = `-o ${options.outputPath}`

  return runGoCommand(context, 'build', [output, mainFile])
}
