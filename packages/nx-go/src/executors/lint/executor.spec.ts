import { ExecutorContext } from '@nx/devkit';
import * as commonFunctions from '../../common';
import executor from './executor';
import { LintExecutorSchema } from './schema';

jest.mock('../../common', () => ({
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
    const spyExecute = jest.spyOn(commonFunctions, 'executeCommand');
    const output = await executor(options, context);
    expect(output.success).toBeTruthy();
    expect(spyExecute).toHaveBeenCalledWith('fmt', ['./...'], {
      cwd: 'apps/project',
    });
  });
});
