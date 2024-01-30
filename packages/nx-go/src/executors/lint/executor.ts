import { ExecutorContext, logger } from '@nx/devkit';
import { execute, extractProjectRoot } from '../../common';
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
  try {
    await execute('fmt', ['./...'], { cwd: extractProjectRoot(context) });
    return { success: true };
  } catch (error) {
    logger.error(error);
    return { success: false };
  }
}
