import { ExecutorContext, logger } from '@nx/devkit';
import * as commonFunctions from '../../common';
import executor from './executor';
import { LintExecutorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  logger: { error: jest.fn() },
}));
jest.mock('../../common', () => ({
  execute: jest.fn(),
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
    const spyExecute = jest.spyOn(commonFunctions, 'execute');
    const output = await executor(options, context);
    expect(output.success).toBeTruthy();
    expect(spyExecute).toHaveBeenCalledWith('fmt', ['./...'], {
      cwd: 'apps/project',
    });
  });

  it('should fail executor if command fails', async () => {
    const error = new Error('lint command failed');
    jest.spyOn(commonFunctions, 'execute').mockImplementation(() => {
      throw error;
    });
    const output = await executor(options, context);
    expect(output.success).toBeFalsy();
    expect(logger.error).toHaveBeenCalledWith(error);
  });
});
