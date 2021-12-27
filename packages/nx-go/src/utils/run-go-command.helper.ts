import { ExecutorContext } from '@nrwl/devkit'
import { execSync } from 'child_process'

export function runGoCommand(
  context: ExecutorContext,
  command: 'build' | 'fmt' | 'run' | 'test',
  params: string[],
  options: { cwd?: string; cmd?: string } = {},
): { success: boolean } {
  // Take the parameters or set defaults
  const cmd = options.cmd || 'go'
  const cwd = options.cwd || process.cwd()

  // Create the command to execute
  const execute = `${cmd} ${command} ${params.join(' ')}`

  try {
    console.log(`Executing command: ${execute}`)
    execSync(execute, { cwd, stdio: [0, 1, 2] })
    return { success: true }
  } catch (e) {
    console.error(`Failed to execute command: ${execute}`, e)
    return { success: false }
  }
}
