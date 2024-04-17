import { ExecutorContext } from '@nx/devkit';
import { executeCommand, extractProjectRoot } from '../../utils';
import { TidyExecutorSchema } from './schema';

/**
 * This executor lints Go code using the `go fmt` command.
 *
 * @param schema options passed to the executor
 * @param context context passed to the executor
 */
export default async function runExecutor(
  schema: TidyExecutorSchema,
  context: ExecutorContext
) {
  return executeCommand(['mod', 'tidy', ...(schema.args ?? [])], {
    cwd: extractProjectRoot(context),
  });
}
