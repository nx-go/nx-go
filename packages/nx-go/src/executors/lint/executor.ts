import { ExecutorContext } from '@nrwl/devkit'
import { LintExecutorSchema } from './schema'
import { execSync } from 'child_process'

export default async function runExecutor(options: LintExecutorSchema, context: ExecutorContext) {
  const projectName = context.projectName
  const cwd = context.workspace.projects[projectName]?.root ?? ''
  const isVerbose = context.isVerbose ?? false

  const sources = `./...`
  const linter = options.linter ?? 'go fmt' // Keeping default from initial version of linter
  const args = options.args?.trim() ?? ''
  const command = [linter, args, sources].filter((a) => a).join(' ')

  if (isVerbose) {
    console.log(`Executing Lint linter: '${linter}', arguments: '${args}', cwd: '${cwd}', command: '${command}'`)
  }
  try {
    execSync(command, { cwd, stdio: [0, 1, 2] })
    return { success: true }
  } catch (ex) {
    console.error(ex)
    return { success: false }
  }
}
