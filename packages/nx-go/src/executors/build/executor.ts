import { ExecutorContext } from '@nrwl/devkit'
import { runGoCommand } from '../../utils'
import { BuildExecutorSchema } from './schema'

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
  const mainFile = `${options.main}`
  const output = `-o ${options.outputPath}`

  const cmd = [...options.env, 'go'].join(' ')

  return runGoCommand(context, 'build', [...options.flags, output, mainFile], { cmd })
}
