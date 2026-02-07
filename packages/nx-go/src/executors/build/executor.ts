import { ExecutorContext, joinPathFragments, offsetFromRoot } from '@nx/devkit';
import {
  buildStringFlagIfValid,
  executeCommand,
  extractProjectRoot,
  resolveWorkingDirectory,
} from '../../utils';
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
  return executeCommand(buildParams(options, context), {
    cwd: resolveWorkingDirectory(context),
    env: options.env,
    executable: buildExecutable(options.compiler),
  });
}

/**
 * Builds the parameters for the `go build` command.
 *
 * @param options options passed to the executor
 * @param context context passed to the executor
 * @returns an array of strings representing the parameters for the `go build` command
 */
const buildParams = (
  options: BuildExecutorSchema,
  context: ExecutorContext
): string[] => {
  return [
    'build',
    '-o',
    buildOutputPath(context, options.outputPath),
    ...buildStringFlagIfValid('-buildmode', options.buildMode),
    ...(options.flags ?? []),
    options.main ?? '.',
  ];
};

/**
 * Builds the output path of the executable based on the project root.
 *
 * @param context executor context
 * @param customPath custom path to use first
 * @return the output path as a string
 */
const buildOutputPath = (
  context: ExecutorContext,
  customPath?: string
): string => {
  const projectRoot = extractProjectRoot(context);
  const defaultPath = joinPathFragments(
    offsetFromRoot(projectRoot),
    'dist',
    projectRoot
  );
  const extension = process.platform === 'win32' ? '.exe' : '';
  return (customPath ?? defaultPath) + extension;
};

/**
 * Determines the executable command based on the provided compiler.
 *
 * @param compiler compiler to use, which can be either 'tinygo' or 'go'.
 * @returns the executable command as a string, either 'tinygo' or 'go'.
 */
const buildExecutable = (
  compiler: BuildExecutorSchema['compiler']
): string | undefined => (compiler === 'tinygo' ? 'tinygo' : undefined);
