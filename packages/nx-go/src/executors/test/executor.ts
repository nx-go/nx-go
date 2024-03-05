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
      options.verbose ? '-v' : '',
      ...buildFlagIfNotSkipped('-cover', options.skipCover),
      ...buildFlagIfNotSkipped('-race', options.skipRace),
      './...',
    ],
    { cwd: extractProjectRoot(context) }
  );
}

const buildFlagIfNotSkipped = (flag: string, skipped: boolean): string[] => {
  return skipped ? [] : [flag];
};
