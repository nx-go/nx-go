import { ExecutorContext } from '@nx/devkit';
import * as sharedFunctions from '../../utils';
import executor from './executor';
import { GenerateExecutorSchema } from './schema';

jest.mock('../../utils', () => ({
  executeCommand: jest.fn().mockResolvedValue({ success: true }),
  extractProjectRoot: jest.fn(() => 'apps/project'),
}));

const options: GenerateExecutorSchema = {};

const context: ExecutorContext = {
  cwd: 'current-dir',
  root: '',
  isVerbose: false,
};

describe('Generate Executor', () => {
  it('should execute generate command with default options', async () => {
    const output = await executor(options, context);
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(['generate'], {
      cwd: 'apps/project',
    });
  });

  it('should execute generate command with custom options', async () => {
    const output = await executor({ ...options, args: ['-v'] }, context);
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['generate', '-v'],
      { cwd: 'apps/project' }
    );
  });
});
