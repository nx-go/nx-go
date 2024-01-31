import * as child_process from 'child_process';
import { run } from './run';

jest.mock('child_process', () => ({
  execSync: jest.fn((cmd) => Buffer.from(`output ${cmd}`, 'utf-8')),
}));

describe('run', () => {
  it('should spawn go command with default options', () => {
    expect(run('version')).toBe('output go version');
  });

  it('should spawn go command with custom options', () => {
    const spyExecSync = jest.spyOn(child_process, 'execSync');
    run('build', ['--flag'], {
      cmd: 'gow',
      cwd: '/tmp',
      env: { hello: 'world' },
    });
    expect(spyExecSync).toHaveBeenCalledWith(
      'gow build --flag',
      {
        cwd: '/tmp',
        env: { ...process.env, hello: 'world' },
        stdio: [0, 1, 2],
      }
    );
  });

  it('should handle error when spawning a go command', async () => {
    const spyExecSync = jest.spyOn(child_process, 'execSync');
    const spawnError = new Error('spawn error');
    spyExecSync.mockImplementationOnce(() => {
      throw spawnError;
    });
    try {
      run('build');
      fail('should have thrown an error');
    } catch (error) {
      expect(error).toEqual(spawnError);
    }
  });
});
