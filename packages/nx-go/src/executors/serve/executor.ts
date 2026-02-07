import { ExecutorContext } from '@nx/devkit';
import {
  executeCommand,
  extractProjectRoot,
  resolveWorkingDirectory,
} from '../../utils';
import { ServeExecutorSchema } from './schema';

/**
 * This executor runs a Go program using the `go run` command.
 *
 * @param options options passed to the executor
 * @param context context passed to the executor
 */
export default async function runExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext
) {
  const cwd = options.cwd ?? resolveWorkingDirectory(context);
  const directory = options.cwd ?? extractProjectRoot(context);
  const mainFile = options.main.replace(`${directory}/`, '');
  return executeCommand(
    ['run', ...(options.flags ?? []), mainFile, ...(options.args ?? [])],
    { executable: options.cmd, cwd }
  );
}
