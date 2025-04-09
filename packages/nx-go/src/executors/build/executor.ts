import { ExecutorContext } from '@nx/devkit';
import {
  buildStringFlagIfValid,
  executeCommand,
  extractProjectRoot,
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
    cwd: context.cwd,
    env: options.env,
    executable: buildExecutable(options.compiler),
  });
}

const buildParams = (
  options: BuildExecutorSchema,
  context: ExecutorContext
): string[] => {
  return [
    'build',
    '-o',
    buildOutputPath(
      extractProjectRoot(context),
      options.extension,
      options.outputPath
    ),
    ...buildStringFlagIfValid('-buildmode', options.buildMode),
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
const buildOutputPath = (
  projectRoot: string,
  extension: BuildExecutorSchema['extension'],
  customPath?: string
): string => {
  let ext = process.platform === 'win32' ? '.exe' : '';

  if (extension !== 'inherit') {
    ext = extension;
  }
  return (customPath ?? `dist/${projectRoot}`) + ext;
};

/**
 * Determines the executable command based on the provided compiler.
 *
 * @param compiler - The compiler to use, which can be either 'tinygo' or 'go'.
 * @returns The executable command as a string, either 'tinygo' or 'go'.
 */
const buildExecutable = (
  compiler: BuildExecutorSchema['compiler']
): string | undefined => (compiler === 'tinygo' ? 'tinygo' : undefined);
