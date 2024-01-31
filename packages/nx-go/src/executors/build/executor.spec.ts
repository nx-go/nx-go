import { ExecutorContext } from '@nx/devkit';
import * as commonFunctions from '../../common';
import executor from './executor';
import { BuildExecutorSchema } from './schema';

jest.mock('../../common', () => ({
  executeCommand: jest.fn().mockResolvedValue({ success: true }),
  extractProjectRoot: jest.fn(() => 'apps/project'),
}));

const options: BuildExecutorSchema = {
  main: 'apps/project/main.go',
  env: { hello: 'world' },
};

const context: ExecutorContext = {
  cwd: 'current-dir',
  root: '',
  isVerbose: false,
};

describe('Build Executor', () => {
  it.each`
    platform   | outputPath
    ${'win32'} | ${'dist/apps/project.exe'}
    ${'linux'} | ${'dist/apps/project'}
  `(
    'should execute build command on platform $platform',
    async ({ platform, outputPath }) => {
      Object.defineProperty(process, 'platform', { value: platform });
      const spyExecute = jest.spyOn(commonFunctions, 'executeCommand');
      const output = await executor(options, context);
      expect(output.success).toBeTruthy();
      expect(spyExecute).toHaveBeenCalledWith(
        'build',
        ['-o', outputPath, 'apps/project/main.go'],
        { cwd: 'current-dir', env: { hello: 'world' } }
      );
    }
  );

  it('should execute build command with custom output path and flags', async () => {
    await executor(
      { ...options, outputPath: 'custom-path', flags: ['--flag1', '--flag2'] },
      context
    );
    expect(commonFunctions.executeCommand).toHaveBeenCalledWith(
      'build',
      ['-o', 'custom-path', '--flag1', '--flag2', 'apps/project/main.go'],
      expect.anything()
    );
  });
});
