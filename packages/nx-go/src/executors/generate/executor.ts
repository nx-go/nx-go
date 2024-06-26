import type { ExecutorContext } from '@nx/devkit';
import { executeCommand, extractProjectRoot } from '../../utils';
import type { GenerateExecutorSchema } from './schema';

/**
 * This executor runs a tool using `go generate` command.
 *
 * @param schema options passed to the executor
 * @param context context passed to the executor
 */
export default async function runExecutor(
  schema: GenerateExecutorSchema,
  context: ExecutorContext
) {
  return executeCommand(['generate', ...(schema.args ?? [])], {
    cwd: extractProjectRoot(context),
  });
}
