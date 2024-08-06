import type { ExecutorContext } from '@nx/devkit';
import {
  buildFlagIfEnabled,
  buildStringFlagIfValid,
  executeCommand,
  extractProjectRoot,
} from '../../utils';
import type { TestExecutorSchema } from './schema';

/**
 * This executor tests Go code using the `go test` command.
 *
 * @param options options passed to the executor
 * @param context context passed to the executor
 */
export default async function runExecutor(
  options: TestExecutorSchema,
  context: ExecutorContext
) {
  return executeCommand(
    [
      'test',
      ...buildFlagIfEnabled('-v', options.verbose),
      ...buildFlagIfEnabled('-cover', options.cover),
      ...buildStringFlagIfValid(`-coverprofile`, options.coverProfile),
      ...buildFlagIfEnabled('-race', options.race),
      ...buildStringFlagIfValid(`-run`, options.run),
      ...buildStringFlagIfValid(
        '-count',
        options.count > 0 ? options.count.toString() : undefined
      ),
      ...buildStringFlagIfValid(`-timeout`, options.timeout),
      './...',
    ],
    { cwd: extractProjectRoot(context) }
  );
}
