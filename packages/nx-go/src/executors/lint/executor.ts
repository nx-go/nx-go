import { ExecutorContext } from '@nx/devkit';
import { executeCommand, extractProjectRoot } from '../../common';
import { LintExecutorSchema } from './schema';

/**
 * This executor lints Go code using the `go fmt` command.
 *
 * @param _ options passed to the executor
 * @param context context passed to the executor
 */
export default async function runExecutor(
  _: LintExecutorSchema,
  context: ExecutorContext
) {
  return executeCommand('fmt', ['./...'], { cwd: extractProjectRoot(context) });
}
