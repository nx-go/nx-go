import { ExecutorContext } from '@nx/devkit';
import * as commonFunctions from '../../utils';
import executor from './executor';
import { ServeExecutorSchema } from './schema';

jest.mock('../../utils', () => ({
  executeCommand: jest.fn().mockResolvedValue({ success: true }),
  extractProjectRoot: jest.fn(() => 'apps/project'),
}));

const options: ServeExecutorSchema = {
  main: 'hello_world.go',
};

const context: ExecutorContext = {
  cwd: 'current-dir',
  root: '',
  isVerbose: false,
};

describe('Serve Executor', () => {
  it('should run Go program with default parameters', async () => {
    const spyExecute = jest.spyOn(commonFunctions, 'executeCommand');
    const output = await executor(options, context);
    expect(output.success).toBeTruthy();
    expect(spyExecute).toHaveBeenCalledWith(['run', 'hello_world.go'], {
      cwd: 'apps/project',
    });
  });

  it('should run Go program with custom directory', async () => {
    const spyExecute = jest.spyOn(commonFunctions, 'executeCommand');
    const output = await executor(
      { ...options, args: ['--help'], cwd: '/tmp/custom/path' },
      context
    );
    expect(output.success).toBeTruthy();
    expect(spyExecute).toHaveBeenCalledWith(
      ['run', 'hello_world.go', '--help'],
      { cwd: '/tmp/custom/path' }
    );
  });

  it('should run Go program with custom executable', async () => {
    const spyExecute = jest.spyOn(commonFunctions, 'executeCommand');
    const output = await executor({ ...options, cmd: 'tinygo' }, context);
    expect(output.success).toBeTruthy();
    expect(spyExecute).toHaveBeenCalledWith(
      ['run', 'hello_world.go'],
      expect.objectContaining({ executable: 'tinygo' })
    );
  });

  it('should remove directory from main file path', async () => {
    const spyExecute = jest.spyOn(commonFunctions, 'executeCommand');
    const output = await executor(
      { ...options, main: 'apps/project/hello_world.go' },
      context
    );
    expect(output.success).toBeTruthy();
    expect(spyExecute).toHaveBeenCalledWith(['run', 'hello_world.go'], {
      cwd: 'apps/project',
    });
  });
});
