import { ExecutorContext } from '@nx/devkit';
import * as commonFunctions from '../../utils';
import executor from './executor';
import { TestExecutorSchema } from './schema';

jest.mock('../../utils', () => ({
  executeCommand: jest.fn().mockResolvedValue({ success: true }),
  extractProjectRoot: jest.fn(() => 'apps/project'),
}));

const options: TestExecutorSchema = {};

const context: ExecutorContext = {
  cwd: 'current-dir',
  root: '',
  isVerbose: false,
};

describe('Test Executor', () => {
  it('should execute test of a go project with default options', async () => {
    const spyExecute = jest.spyOn(commonFunctions, 'executeCommand');
    const output = await executor(options, context);
    expect(output.success).toBeTruthy();
    expect(spyExecute).toHaveBeenCalledWith(
      ['test', '-v', './...', '-cover', '-race'],
      { cwd: 'apps/project' }
    );
  });

  it.each`
    config                 | flag
    ${{ skipCover: true }} | ${'-cover'}
    ${{ skipRace: true }}  | ${'-race'}
  `('should remove flag $flag if skipped', async ({ config, flag }) => {
    const spyExecute = jest.spyOn(commonFunctions, 'executeCommand');
    const output = await executor({ ...options, ...config }, context);
    expect(output.success).toBeTruthy();
    expect(spyExecute).toHaveBeenCalledWith(
      expect.not.arrayContaining([flag]),
      { cwd: 'apps/project' }
    );
  });
});
