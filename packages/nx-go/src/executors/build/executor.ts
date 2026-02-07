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
    buildOutputPath(context, options),
    ...buildStringFlagIfValid('-buildmode', options.buildMode),
    ...(options.flags ?? []),
    options.main ?? '.',
  ];
};

/**
 * Builds the output path of the executable based on the project root.
 *
 * @param context executor context
 * @param options executor options containing outputPath and env
 * @return the output path as a string
 */
const buildOutputPath = (
  context: ExecutorContext,
  { env, outputPath }: BuildExecutorSchema
): string => {
  const projectRoot = extractProjectRoot(context);
  const defaultPath = joinPathFragments(
    offsetFromRoot(projectRoot),
    'dist',
    projectRoot
  );

  return (outputPath ?? defaultPath) + buildExtension(env);
};

/**
 * Determines the file extension for the compiled binary based on the target OS.
 *
 * Use GOOS env variable, or fall back to host platform.
 * Check for 'windows' (GOOS value) and 'win32' (process.platform value)
 *
 * @param env environment variables containing GOOS
 * @returns the file extension string ('.exe' for Windows, empty string otherwise)
 */
const buildExtension = (env?: BuildExecutorSchema['env']): string => {
  const targetOS = env?.GOOS ?? process.platform;
  return targetOS === 'windows' || targetOS === 'win32' ? '.exe' : '';
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
