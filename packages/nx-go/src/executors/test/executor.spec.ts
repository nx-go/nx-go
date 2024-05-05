import type { ExecutorContext } from '@nx/devkit';
import * as commonFunctions from '../../utils';
import executor from './executor';
import type { TestExecutorSchema } from './schema';

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
    expect(spyExecute).toHaveBeenCalledWith(['test', './...'], {
      cwd: 'apps/project',
    });
  });

  it.each`
    config                              | flag
    ${{ verbose: true }}                | ${'-v'}
    ${{ cover: true }}                  | ${'-cover'}
    ${{ coverProfile: 'coverage.out' }} | ${'-coverprofile=coverage.out'}
    ${{ race: true }}                   | ${'-race'}
    ${{ run: 'TestProjection' }}        | ${'-run=TestProjection'}
  `('should add flag $flag if enabled', async ({ config, flag }) => {
    const spyExecute = jest.spyOn(commonFunctions, 'executeCommand');
    const output = await executor({ ...options, ...config }, context);
    expect(output.success).toBeTruthy();
    expect(spyExecute).toHaveBeenCalledWith(expect.arrayContaining([flag]), {
      cwd: 'apps/project',
    });
  });
});
