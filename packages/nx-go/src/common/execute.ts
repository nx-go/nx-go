import { logger } from '@nx/devkit';
import { execFile } from 'child_process';
import { promisify } from 'util';

export type GoCommand = 'build' | 'version';

export type RunGoOptions = {
  cmd?: string;
  cwd?: string;
  env?: { [key: string]: string };
};

const execFileAsync = promisify(execFile);

const spawnCommand = async (
  executable: string,
  args: string[],
  directory: string,
  env: { [key: string]: string }
): Promise<string> => {
  logger.info(`Executing command: ${executable} ${args.join(' ')}`);
  const result = await execFileAsync(executable, args, { cwd: directory, env });
  return result.stderr
    ? Promise.reject(new Error(result.stderr))
    : result.stdout;
};

export const execute = async (
  command: GoCommand,
  params: string[] = [],
  options: RunGoOptions = {}
): Promise<string> => {
  const { cmd = 'go', cwd = null, env = {} } = options;
  const envWithProcess = Object.assign(process.env, env);
  return spawnCommand(cmd, [command, ...params], cwd, envWithProcess);
};
