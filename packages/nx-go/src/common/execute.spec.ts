import { logger } from '@nx/devkit';
import * as child_process from 'child_process';
import { execute } from './execute';

jest.mock('@nx/devkit', () => ({
  logger: { info: jest.fn() },
}));
jest.mock('child_process', () => ({
  execFile: jest.fn((cmd, args, _options, callback) => {
    callback(null, { stdout: `output ${cmd} ${args}` } as never, null);
    return null;
  }),
}));

describe('execute', () => {
  it('should spawn go command with default options', async () => {
    await expect(execute('version')).resolves.toBe('output go version');
  });

  it('should spawn go command with custom options', async () => {
    const spyExecFile = jest.spyOn(child_process, 'execFile');
    await execute('build', ['--flag'], {
      cwd: '/tmp',
      env: { hello: 'world' },
    });
    expect(spyExecFile).toHaveBeenCalledWith(
      'go',
      ['build', '--flag'],
      { cwd: '/tmp', env: { ...process.env, hello: 'world' } },
      expect.anything()
    );
  });

  it('should handle error when spawning a go command', async () => {
    const spyExecFile = jest.spyOn(child_process, 'execFile');
    spyExecFile.mockImplementationOnce((_, _args, _options, callback) => {
      callback(new Error('spawn error'), null, null);
      return null;
    });
    await expect(execute('build')).rejects.toThrow('spawn error');
  });

  it('should handle error of a go command', async () => {
    const spyExecFile = jest.spyOn(child_process, 'execFile');
    spyExecFile.mockImplementationOnce((_, _args, _options, callback) => {
      callback(null, { stderr: 'command error' } as never, null);
      return null;
    });
    await expect(execute('build')).rejects.toThrow('command error');
  });

  it('should log executed command', async () => {
    await execute('build', ['--flag']);
    expect(logger.info).toHaveBeenCalledWith(
      'Executing command: go build --flag'
    );
  });
});
