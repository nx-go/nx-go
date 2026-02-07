import { ExecutorContext } from '@nx/devkit';
import * as sharedFunctions from '../../utils';
import executor from './executor';
import { BuildExecutorSchema } from './schema';

jest.mock('../../utils', () => {
  const { buildStringFlagIfValid } = jest.requireActual('../../utils');
  return {
    buildStringFlagIfValid,
    executeCommand: jest.fn().mockResolvedValue({ success: true }),
    extractProjectRoot: jest.fn(() => 'apps/project'),
    resolveWorkingDirectory: jest.fn(() => 'apps/project'),
  };
});

const options: BuildExecutorSchema = {
  main: 'main.go',
  env: { hello: 'world' },
};

const context: ExecutorContext = {
  cwd: '',
  root: '',
  isVerbose: false,
  projectsConfigurations: undefined,
  nxJsonConfiguration: undefined,
  projectGraph: undefined,
};

describe('Build Executor', () => {
  it.each`
    platform    | outputPath
    ${'win32'}  | ${'../../dist/apps/project.exe'}
    ${'linux'}  | ${'../../dist/apps/project'}
    ${'darwin'} | ${'../../dist/apps/project'}
  `(
    'should execute build command on platform $platform (host platform detection)',
    async ({ platform, outputPath }) => {
      Object.defineProperty(process, 'platform', { value: platform });
      const output = await executor(options, context);
      expect(output.success).toBeTruthy();
      expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
        ['build', '-o', outputPath, 'main.go'],
        { cwd: 'apps/project', env: { hello: 'world' } }
      );
    }
  );

  it.each`
    goos         | hostPlatform | outputPath
    ${'linux'}   | ${'win32'}   | ${'../../dist/apps/project'}
    ${'darwin'}  | ${'win32'}   | ${'../../dist/apps/project'}
    ${'windows'} | ${'linux'}   | ${'../../dist/apps/project.exe'}
    ${'windows'} | ${'darwin'}  | ${'../../dist/apps/project.exe'}
  `(
    'should respect GOOS=$goos from executor config when cross-compiling from $hostPlatform',
    async ({ goos, hostPlatform, outputPath }) => {
      Object.defineProperty(process, 'platform', { value: hostPlatform });
      const output = await executor(
        { ...options, env: { ...options.env, GOOS: goos } },
        context
      );
      expect(output.success).toBeTruthy();
      expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
        ['build', '-o', outputPath, 'main.go'],
        { cwd: 'apps/project', env: { hello: 'world', GOOS: goos } }
      );
    }
  );

  it.each`
    goos         | hostPlatform | outputPath
    ${'linux'}   | ${'win32'}   | ${'../../dist/apps/project'}
    ${'darwin'}  | ${'win32'}   | ${'../../dist/apps/project'}
    ${'windows'} | ${'linux'}   | ${'../../dist/apps/project.exe'}
    ${'windows'} | ${'darwin'}  | ${'../../dist/apps/project.exe'}
  `(
    'should respect GOOS=$goos from process.env when cross-compiling from $hostPlatform',
    async ({ goos, hostPlatform, outputPath }) => {
      Object.defineProperty(process, 'platform', { value: hostPlatform });
      const originalGOOS = process.env.GOOS;
      process.env.GOOS = goos;

      const output = await executor(options, context);
      expect(output.success).toBeTruthy();
      expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
        ['build', '-o', outputPath, 'main.go'],
        { cwd: 'apps/project', env: { hello: 'world' } }
      );

      // Restore original value
      if (originalGOOS === undefined) {
        delete process.env.GOOS;
      } else {
        process.env.GOOS = originalGOOS;
      }
    }
  );

  it('should execute build in another working directory', async () => {
    const output = await executor(options, {
      ...context,
      cwd: 'some/other/path',
    });
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['build', '-o', '../../dist/apps/project', 'main.go'],
      { cwd: 'apps/project', env: { hello: 'world' } }
    );
  });

  it('should execute build command using TinyGo compiler', async () => {
    await executor({ ...options, compiler: 'tinygo' }, context);
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['build', '-o', '../../dist/apps/project', 'main.go'],
      expect.objectContaining({ executable: 'tinygo' })
    );
  });

  it('should execute build command with custom output path and flags', async () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    await executor(
      { ...options, outputPath: 'custom-path', flags: ['--flag1'] },
      context
    );
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['build', '-o', 'custom-path', '--flag1', 'main.go'],
      expect.anything()
    );
  });

  it('should add .exe extension to custom output path when targeting Windows', async () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    await executor(
      { ...options, outputPath: 'custom-path', env: { GOOS: 'windows' } },
      context
    );
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['build', '-o', 'custom-path.exe', 'main.go'],
      expect.anything()
    );
  });

  it.each`
    config                       | flag
    ${{ buildMode: 'c-shared' }} | ${'-buildmode=c-shared'}
  `('should add flag $flag if enabled', async ({ config, flag }) => {
    expect(
      (await executor({ ...options, ...config }, context)).success
    ).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      expect.arrayContaining([flag]),
      expect.anything()
    );
  });

  it('should default to current directory when main is not provided', async () => {
    const optionsWithoutMain = {
      env: { hello: 'world' },
    };
    const output = await executor(optionsWithoutMain, context);
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['build', '-o', '../../dist/apps/project', '.'],
      { cwd: 'apps/project', env: { hello: 'world' } }
    );
  });
});
