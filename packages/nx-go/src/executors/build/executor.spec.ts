import { ExecutorContext, logger } from '@nx/devkit';
import * as executeFunctions from '../../common/execute';
import executor from './executor';
import { BuildExecutorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  logger: { error: jest.fn() },
}));
jest.mock('../../common/execute');

const options: BuildExecutorSchema = {
  main: 'apps/project/main.go',
  env: { hello: 'world' },
};

const context: ExecutorContext = {
  projectName: 'project',
  cwd: 'current-dir',
  root: '',
  isVerbose: false,
  projectsConfigurations: {
    projects: { project: { root: 'apps/project' } },
    version: 1,
  },
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
      const spyExecute = jest.spyOn(executeFunctions, 'execute');
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
    expect(executeFunctions.execute).toHaveBeenCalledWith(
      'build',
      ['-o', 'custom-path', '--flag1', '--flag2', 'apps/project/main.go'],
      expect.anything()
    );
  });

  it('should fail executor if command fails', async () => {
    const error = new Error('command failed');
    jest.spyOn(executeFunctions, 'execute').mockImplementation(() => {
      throw error;
    });
    const output = await executor(options, context);
    expect(output.success).toBeFalsy();
    expect(logger.error).toHaveBeenCalledWith(error);
  });
});
