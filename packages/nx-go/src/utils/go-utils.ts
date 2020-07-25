import {BuilderContext} from "@angular-devkit/architect";
import {execSync} from "child_process";

export function runGoCommand(context: BuilderContext, command: 'build'|'fmt'|'run'|'test', params: string[], cwd?: string): { success: boolean } {
  const cmd = `go ${command} ${params.join(' ')}`
  cwd = cwd || process.cwd()
  try {
    context.logger.info(`Executing command: ${cmd}`);
    execSync(cmd, { cwd, stdio: [0, 1, 2]})
    return { success: true }
  } catch (e) {
    context.logger.error(`Failed to execute command: ${cmd}`, e);
    return { success: false }
  }
}
