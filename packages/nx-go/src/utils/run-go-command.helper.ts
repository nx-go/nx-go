import { ExecutorContext } from '@nrwl/devkit'
import { execSync } from 'child_process'

export interface RunGoCommandOptions {
  cwd?: string
  cmd?: string
  env?: { [key: string]: string }
}

export type RunGoCommand = (
  context: ExecutorContext,
  command: 'build' | 'fmt' | 'run' | 'test',
  params: string[],
  options: RunGoCommandOptions,
) => { success: boolean }

export const runGoCommand: RunGoCommand = (
  context: ExecutorContext,
  command: 'build' | 'fmt' | 'run' | 'test',
  params: string[],
  options: RunGoCommandOptions = {},
) => {
  // Take the parameters or set defaults
  const cmd = options.cmd || 'go'
  const cwd = options.cwd || process.cwd()

  // Create the command to execute
  const execute = `${cmd} ${command} ${params.join(' ')}`

  // Pass along the environment variables to the process
  const env = options.env ? { ...process.env, ...options.env } : process.env

  try {
    console.log(`Executing command: ${execute}`)
    execSync(execute, { cwd, stdio: [0, 1, 2], env })
    return { success: true }
  } catch (e) {
    console.error(`Failed to execute command: ${execute}`, e)
    return { success: false }
  }
}
