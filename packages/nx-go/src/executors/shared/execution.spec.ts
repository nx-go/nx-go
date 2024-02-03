import { ExecutorContext, logger } from '@nx/devkit';
import * as runFunctions from '../../common/run';
import { executeCommand, extractProjectRoot } from './execution';

jest.mock('@nx/devkit', () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));
jest.mock('../../common/run', () => ({ run: jest.fn() }));

describe('execution', () => {
  describe('Method: extractProjectRoot', () => {
    it('should use project configuration to extract its root', () => {
      const context: ExecutorContext = {
        projectName: 'proj',
        cwd: '',
        isVerbose: false,
        root: '/root',
        projectsConfigurations: {
          projects: { proj: { root: '/root/project' } },
          version: 1,
        },
      };
      expect(extractProjectRoot(context)).toBe('/root/project');
    });
  });

  describe('Method: executeCommand', () => {
    it('should execute a successfully command', async () => {
      const spyLoggerInfo = jest.spyOn(logger, 'info');
      const result = await executeCommand(['build', '--flag1'], {
        executable: 'go',
      });
      expect(result.success).toBeTruthy();
      expect(spyLoggerInfo).toHaveBeenCalledWith(
        'Executing command: go build --flag1'
      );
    });

    it('should execute a failed command', async () => {
      const spyLoggerInfo = jest.spyOn(logger, 'info');
      const spyLoggerError = jest.spyOn(logger, 'error');

      const error = new Error('run error');
      jest.spyOn(runFunctions, 'run').mockImplementationOnce(() => {
        throw error;
      });
      const result = await executeCommand(['version']);

      expect(result.success).toBeFalsy();
      expect(spyLoggerError).toHaveBeenCalledWith(error);
      expect(spyLoggerInfo).toHaveBeenCalledWith(
        'Executing command: go version'
      );
    });
  });
});
