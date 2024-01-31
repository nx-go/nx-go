import { ExecutorContext } from '@nx/devkit';
import { executeCommand, extractProjectRoot } from '../../common';
import { TestExecutorSchema } from './schema';

export default async function runExecutor(
  options: TestExecutorSchema,
  context: ExecutorContext
) {
  return executeCommand(
    'test',
    [
      '-v',
      './...',
      ...buildFlagIfNotSkiped('-cover', options.skipCover),
      ...buildFlagIfNotSkiped('-race', options.skipRace),
    ],
    { cwd: extractProjectRoot(context) }
  );
}

const buildFlagIfNotSkiped = (flag: string, skiped: boolean): string[] => {
  return skiped ? [] : [flag];
};
