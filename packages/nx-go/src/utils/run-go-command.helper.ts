import { ExecutorContext } from '@nrwl/devkit'
import { execSync } from 'child_process'

export function runGoCommand(
  context: ExecutorContext,
  command: 'build' | 'fmt' | 'run' | 'test' | 'version',
  params: string[],
  options: { cwd?: string; cmd?: string } = {},
): { success: boolean; logs: Buffer } {
  // Take the parameters or set defaults
  const cmd = options.cmd || 'go'
  const cwd = options.cwd || process.cwd()

  // Create the command to execute
  const execute = `${cmd} ${command} ${params.join(' ')}`

  try {
    console.log(`Executing command: ${execute}`)
    const logs = execSync(execute, { cwd })
    return { success: true, logs }
  } catch (e) {
    console.error(`Failed to execute command: ${execute}`, e)
    return { success: false, logs: Buffer.of() }
  }
}
