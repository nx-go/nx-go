import { ExecutorContext, logger } from '@nx/devkit';
import { execSync } from 'child_process';

export type RunGoOptions = {
  executable?: string;
  cwd?: string;
  env?: { [key: string]: string };
};

/**
 * Extract the project root from the executor context.
 *
 * @param context the executor context
 */
export const extractProjectRoot = (context: ExecutorContext): string =>
  context.projectsConfigurations.projects[context.projectName].root;

/**
 * Execute and log a command, then return the result to executor.
 *
 * @param parameters the parameters of the command
 * @param options the options of the command
 */
export const executeCommand = async (
  parameters: string[] = [],
  options: RunGoOptions = {}
): Promise<{ success: boolean }> => {
  try {
    const { executable = 'go', cwd = null, env = {} } = options;

    logger.info(`Executing command: ${[executable, ...parameters].join(' ')}`);
    execSync([executable, ...parameters].join(' '), {
      cwd,
      env: Object.assign(process.env, env),
      stdio: [0, 1, 2],
    });

    return { success: true };
  } catch (error) {
    logger.error(error);
    return { success: false };
  }
};

/**
 * Add a flag to an array of parameter if it is enabled.
 *
 * @param flag the flag to add
 * @param enabled true if flag should be added
 */
export const buildFlagIfEnabled = (flag: string, enabled: boolean): string[] =>
  enabled ? [flag] : [];

/**
 * Add a string flag to an array of parameter if it is valid.
 *
 * @param flag the flag to add
 * @param value the value of the flag
 */
export const buildStringFlagIfValid = (
  flag: string,
  value?: string
): string[] => (value ? [`${flag}=${value}`] : []);
