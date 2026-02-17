import { ExecutorContext } from '@nx/devkit';
import { executeCommand, resolveWorkingDirectory } from '../../utils';
import { ServeAirExecutorSchema } from './schema';

/**
 * This executor runs a Go program using Air live reload with file watching.
 * Air is a live-reloading command line utility for Go applications in development.
 *
 * @see https://github.com/air-verse/air
 * @param options options passed to the executor
 * @param context context passed to the executor
 */
export default async function runExecutor(
  options: ServeAirExecutorSchema,
  context: ExecutorContext
) {
  const cwd = options.cwd ?? resolveWorkingDirectory(context);
  const config = options.config ?? '.air.toml';

  return executeCommand(['-c', config, ...(options.args ?? [])], {
    executable: options.cmd ?? 'air',
    cwd,
  });
}
