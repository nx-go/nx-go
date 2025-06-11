import { ExecutorContext } from '@nx/devkit';
import { executeCommand, extractProjectRoot } from '../../utils';
import { DownloadExecutorSchema } from './schema';

/**
 * This executor runs go mod download on the specified module.
 *
 * @param schema options passed to the executor
 * @param context context passed to the executor
 */
export default async function runExecutor(
  schema: DownloadExecutorSchema,
  context: ExecutorContext
) {
  return executeCommand(['mod', 'download', ...(schema.args ?? [])], {
    cwd: extractProjectRoot(context),
  });
}
