import { ExecutorContext } from '@nx/devkit';
import { executeCommand, extractProjectRoot } from '../../utils';
import { TidyExecutorSchema } from './schema';

/**
 * This executor runs go mod tidy on the specified module.
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
