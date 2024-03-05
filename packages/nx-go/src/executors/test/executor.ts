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
  const packages = options.packages;
  const buildTags = options.buildTags;
  return executeCommand(
    [
      'test',
      options.verbose ? '-v' : '',
      buildTags.length > 0 ? `-tags=${buildTags.join(',')}` : '',
      ...buildFlagIfNotSkipped('-cover', options.skipCover),
      ...buildFlagIfNotSkipped('-race', options.skipRace),
      packages.length > 0 ? packages.join(' ') : './...',
    ],
    { cwd: extractProjectRoot(context) }
  );
}

const buildFlagIfNotSkipped = (flag: string, skipped: boolean): string[] => {
  return skipped ? [] : [flag];
};
