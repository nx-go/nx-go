import { ServeExecutorSchema } from './schema';
import executor from './executor';

const options: ServeExecutorSchema = {};

describe('Serve Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});