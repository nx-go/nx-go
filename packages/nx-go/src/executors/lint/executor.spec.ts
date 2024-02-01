import { ExecutorContext } from '@nx/devkit';
import * as sharedFunctions from '../shared';
import executor from './executor';
import { LintExecutorSchema } from './schema';

jest.mock('../shared', () => ({
  executeCommand: jest.fn().mockResolvedValue({ success: true }),
  extractProjectRoot: jest.fn(() => 'apps/project'),
}));

const options: LintExecutorSchema = {};

const context: ExecutorContext = {
  cwd: 'current-dir',
  root: '',
  isVerbose: false,
};

describe('Lint Executor', () => {
  it('should execute lint command', async () => {
    const spyExecute = jest.spyOn(sharedFunctions, 'executeCommand');
    const output = await executor(options, context);
    expect(output.success).toBeTruthy();
    expect(spyExecute).toHaveBeenCalledWith('fmt', ['./...'], {
      cwd: 'apps/project',
    });
  });
});
