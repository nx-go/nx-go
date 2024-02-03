import { ExecutorContext, logger } from '@nx/devkit';
import { run, RunGoOptions } from '../../common';

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
    const { executable = 'go' } = options;
    logger.info(`Executing command: ${[executable, ...parameters].join(' ')}`);
    run(parameters, options);
    return { success: true };
  } catch (error) {
    logger.error(error);
    return { success: false };
  }
};
