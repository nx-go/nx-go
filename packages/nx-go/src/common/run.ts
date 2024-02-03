import { execSync } from 'child_process';

export type RunGoOptions = {
  executable?: string;
  cwd?: string;
  env?: { [key: string]: string };
};

export const run = (
  parameters: string[] = [],
  options: RunGoOptions = {}
): string => {
  const { executable = 'go', cwd = null, env = {} } = options;
  const result = execSync([executable, ...parameters].join(' '), {
    cwd,
    env: Object.assign(process.env, env),
    stdio: [0, 1, 2],
  });
  return result?.toString();
};
