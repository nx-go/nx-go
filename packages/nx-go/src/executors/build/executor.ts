import { ExecutorContext } from '@nx/devkit';
import { executeCommand, extractProjectRoot } from '../shared';
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
  return executeCommand('build', buildParams(options, context), {
    cwd: context.cwd,
    env: options.env,
  });
}

const buildParams = (
  options: BuildExecutorSchema,
  context: ExecutorContext
): string[] => {
  return [
    '-o',
    buildOutputPath(extractProjectRoot(context), options.outputPath),
    ...(options.flags ?? []),
    options.main,
  ];
};

/**
 * Builds the output path of the executable based on the project root.
 *
 * @param projectRoot project root
 * @param customPath custom path to use first
 */
const buildOutputPath = (projectRoot: string, customPath?: string): string => {
  const extension = process.platform === 'win32' ? '.exe' : '';
  return (customPath ?? `dist/${projectRoot}`) + extension;
};
