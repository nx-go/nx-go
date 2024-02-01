import { ExecutorContext, logger } from '@nx/devkit';
import { GoCommand, run, RunGoOptions } from '../../common';

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
 * @param command the command to execute
 * @param params the parameters of the command
 * @param options the options of the command
 */
export const executeCommand = async (
  command: GoCommand,
  params: string[] = [],
  options: RunGoOptions = {}
): Promise<{ success: boolean }> => {
  try {
    logger.info(
      `Executing command: ${[options.cmd ?? 'go', command, ...params].join(
        ' '
      )}`
    );
    run(command, params, options);
    return { success: true };
  } catch (error) {
    logger.error(error);
    return { success: false };
  }
};
