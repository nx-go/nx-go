import { BuildExecutorSchema } from './schema';
import executor from './executor';
import { ExecutorContext } from '@nx/devkit';

const options: BuildExecutorSchema = {};

const context: ExecutorContext = { cwd: '', root: '', isVerbose: false };

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
