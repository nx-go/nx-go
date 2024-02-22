import { ExecutorContext } from '@nx/devkit';
import { executeCommand, extractProjectRoot } from '../../utils';
import { LintExecutorSchema } from './schema';

/**
 * This executor lints Go code using the `go fmt` command.
 *
 * @param schema options passed to the executor
 * @param context context passed to the executor
 */
export default async function runExecutor(
  schema: LintExecutorSchema,
  context: ExecutorContext
) {
  const defaultArgs = schema.linter == null ? ['fmt'] : [];
  return executeCommand([...defaultArgs, ...(schema.args ?? []), './...'], {
    cwd: extractProjectRoot(context),
    executable: schema.linter,
  });
}
