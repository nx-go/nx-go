import { ExecutorContext, logger } from '@nx/devkit';
import { execute } from '../../common/execute';
import { BuildExecutorSchema } from './schema';

/**
 * This executor builds an executable using the `go build` command.
 *
 * @param options options passed to the executor
 * @param context context passed to the executor
 */
export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  try {
    await execute('build', buildParams(options, context), {
      cwd: context.cwd,
      env: options.env,
    });
    return { success: true };
  } catch (error) {
    logger.error(error);
    return { success: false };
  }
}

const buildParams = (
  options: BuildExecutorSchema,
  context: ExecutorContext
): string[] => {
  return [
    '-o',
    buildOutputPath(context, options.outputPath),
    ...(options.flags ?? []),
    options.main,
  ];
};

/**
 * Builds the output path of the executable based on the project root.
 *
 * @param context executor context
 * @param customPath custom path to use first
 */
const buildOutputPath = (
  context: ExecutorContext,
  customPath?: string
): string => {
  const projectRoot =
    context.projectsConfigurations.projects[context.projectName].root;
  const extension = process.platform === 'win32' ? '.exe' : '';
  return (customPath ?? `dist/${projectRoot}`) + extension;
};
