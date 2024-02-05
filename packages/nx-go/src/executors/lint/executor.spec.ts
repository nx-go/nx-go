import { ExecutorContext } from '@nx/devkit';
import * as sharedFunctions from '../../utils';
import executor from './executor';
import { LintExecutorSchema } from './schema';

jest.mock('../../utils', () => ({
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
  it('should execute lint command with default options', async () => {
    const output = await executor(options, context);
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['fmt', './...'],
      { cwd: 'apps/project' }
    );
  });

  it('should execute lint command with custom linter', async () => {
    const output = await executor({ ...options, linter: 'revive' }, context);
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(['./...'], {
      cwd: 'apps/project',
      executable: 'revive',
    });
  });

  it('should execute lint command with custom options', async () => {
    const output = await executor(
      { ...options, args: ['--config', 'revive.toml'], linter: 'revive' },
      context
    );
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['--config', 'revive.toml', './...'],
      { cwd: 'apps/project', executable: 'revive' }
    );
  });
});
