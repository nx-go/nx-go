import { ExecutorContext } from '@nx/devkit';
import * as sharedFunctions from '../../utils';
import executor from './executor';
import { DownloadExecutorSchema } from './schema';

jest.mock('../../utils', () => ({
  executeCommand: jest.fn().mockResolvedValue({ success: true }),
  extractProjectRoot: jest.fn(() => 'apps/project'),
}));

const options: DownloadExecutorSchema = {};

const context: ExecutorContext = {
  cwd: 'current-dir',
  root: '',
  isVerbose: false,
};

describe('Download Executor', () => {
  it('should execute download command with default options', async () => {
    const output = await executor(options, context);
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['mod', 'download'],
      { cwd: 'apps/project' }
    );
  });

  it('should execute download command with custom options', async () => {
    const output = await executor({ ...options, args: ['--json'] }, context);
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['mod', 'download', '--json'],
      { cwd: 'apps/project' }
    );
  });
});
