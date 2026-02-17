import { ExecutorContext } from '@nx/devkit';
import executor from './executor';
import * as utils from '../../utils';

jest.mock('../../utils', () => ({
  executeCommand: jest.fn().mockResolvedValue({ success: true }),
  extractProjectRoot: jest.fn(() => 'apps/test-app'),
  resolveWorkingDirectory: jest.fn(() => '/workspace/apps/test-app'),
}));

describe('ServeAir Executor', () => {
  const context = { cwd: 'dir', root: '', isVerbose: false } as ExecutorContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run air with default config', async () => {
    const spyExecute = jest.spyOn(utils, 'executeCommand');
    const options = {};

    await executor(options, context);

    expect(spyExecute).toHaveBeenCalledWith(['-c', '.air.toml'], {
      executable: 'air',
      cwd: '/workspace/apps/test-app',
    });
  });

  it('should run air with custom config file', async () => {
    const spyExecute = jest.spyOn(utils, 'executeCommand');
    const options = { config: '.air.yaml' };

    await executor(options, context);

    expect(spyExecute).toHaveBeenCalledWith(['-c', '.air.yaml'], {
      executable: 'air',
      cwd: '/workspace/apps/test-app',
    });
  });

  it('should run air with custom working directory', async () => {
    const spyExecute = jest.spyOn(utils, 'executeCommand');
    const options = { cwd: '/custom/path' };

    await executor(options, context);

    expect(spyExecute).toHaveBeenCalledWith(['-c', '.air.toml'], {
      executable: 'air',
      cwd: '/custom/path',
    });
  });

  it('should pass additional arguments to air', async () => {
    const spyExecute = jest.spyOn(utils, 'executeCommand');
    const options = { args: ['--debug', '--port', '3000'] };

    await executor(options, context);

    expect(spyExecute).toHaveBeenCalledWith(
      ['-c', '.air.toml', '--debug', '--port', '3000'],
      { executable: 'air', cwd: '/workspace/apps/test-app' }
    );
  });

  it('should use custom air binary', async () => {
    const spyExecute = jest.spyOn(utils, 'executeCommand');
    const options = { cmd: 'custom-air' };

    await executor(options, context);

    expect(spyExecute).toHaveBeenCalledWith(['-c', '.air.toml'], {
      executable: 'custom-air',
      cwd: '/workspace/apps/test-app',
    });
  });
});
