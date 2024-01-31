import { execSync } from 'child_process';

export type GoCommand = 'build' | 'fmt' | 'run' | 'test' | 'version';

export type RunGoOptions = {
  cmd?: string;
  cwd?: string;
  env?: { [key: string]: string };
};

export const run = (
  command: GoCommand,
  params: string[] = [],
  options: RunGoOptions = {}
): string => {
  const { cmd = 'go', cwd = null, env = {} } = options;
  const result = execSync([cmd, command, ...params].join(' '), {
    cwd,
    env: Object.assign(process.env, env),
    stdio: [0, 1, 2],
  });
  return result?.toString();
};
