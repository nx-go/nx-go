import { ExecutorContext } from '@nx/devkit';
import { executeCommand, extractProjectRoot } from '../../utils';
import { TestExecutorSchema } from './schema';

export default async function runExecutor(
  options: TestExecutorSchema,
  context: ExecutorContext
) {
  return executeCommand(
    [
      'test',
      '-v',
      './...',
      ...buildFlagIfNotSkipped('-cover', options.skipCover),
      ...buildFlagIfNotSkipped('-race', options.skipRace),
    ],
    { cwd: extractProjectRoot(context) }
  );
}

const buildFlagIfNotSkipped = (flag: string, skipped: boolean): string[] => {
  return skipped ? [] : [flag];
};
