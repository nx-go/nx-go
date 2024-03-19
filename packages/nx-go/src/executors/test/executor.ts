import { ExecutorContext } from '@nx/devkit';
import { executeCommand, extractProjectRoot } from '../../utils';
import { TestExecutorSchema } from './schema';

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
      ...buildFlagIfEnabled('-race', options.race),
      './...',
    ],
    { cwd: extractProjectRoot(context) }
  );
}

const buildFlagIfEnabled = (flag: string, enabled: boolean): string[] => {
  return enabled ? [flag] : [];
};
