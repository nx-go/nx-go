import { type ExecutorContext, logger } from '@nx/devkit';
import * as child_process from 'node:child_process';
import { join } from 'node:path';
import {
  buildFlagIfEnabled,
  buildStringFlagIfValid,
  executeCommand,
  extractProjectRoot,
  resolveWorkingDirectory,
} from './execute-command';

jest.mock('@nx/devkit', () => ({
  logger: { info: jest.fn(), error: jest.fn() },
  joinPathFragments: (...parts: string[]) => parts.join('/'),
}));
jest.mock('node:child_process');

const createExecutorContext = (overrides: Partial<ExecutorContext>) =>
  ({
    isVerbose: false,
    nxJsonConfiguration: {},
    projectGraph: { nodes: {}, dependencies: {} },
    ...overrides,
  } as ExecutorContext);

describe('Execute command', () => {
  describe('Method: extractProjectRoot', () => {
    it('should use project configuration to extract its root', () => {
      expect(
        extractProjectRoot(
          createExecutorContext({
            projectName: 'proj',
            cwd: '',
            root: '/root',
            projectsConfigurations: {
              projects: { proj: { root: '/root/project' } },
              version: 1,
            },
          })
        )
      ).toBe('/root/project');
    });
  });

  describe('Method: resolveWorkingDirectory', () => {
    it('should return workspace root when project root is workspace root', () => {
      expect(
        resolveWorkingDirectory(
          createExecutorContext({
            projectName: 'proj',
            cwd: '/workspace/apps/frontend',
            root: '/workspace',
            projectsConfigurations: {
              projects: { proj: { root: '' } },
              version: 1,
            },
          })
        )
      ).toBe(join('/workspace'));
    });

    it('should return absolute path to project when running from different directory', () => {
      expect(
        resolveWorkingDirectory(
          createExecutorContext({
            projectName: 'backend',
            cwd: '/workspace/apps/frontend',
            root: '/workspace',
            projectsConfigurations: {
              projects: { backend: { root: 'apps/backend' } },
              version: 1,
            },
          })
        )
      ).toBe(join('/workspace/apps/backend'));
    });

    it('should return absolute path to project when running from workspace root', () => {
      expect(
        resolveWorkingDirectory(
          createExecutorContext({
            projectName: 'backend',
            cwd: '/workspace',
            root: '/workspace',
            projectsConfigurations: {
              projects: { backend: { root: 'apps/backend' } },
              version: 1,
            },
          })
        )
      ).toBe(join('/workspace/apps/backend'));
    });
  });

  describe('Method: executeCommand', () => {
    it('should execute a successfully command with default options', async () => {
      const result = await executeCommand(['build'], { cwd: '/workspace' });
      expect(result.success).toBeTruthy();
      expect(child_process.execSync).toHaveBeenCalledWith('go build', {
        cwd: '/workspace',
        env: process.env,
        stdio: [0, 1, 2],
      });
      expect(logger.info).toHaveBeenCalledWith('Executing command: go build');
    });

    it('should execute a successfully command withh custom options', async () => {
      const result = await executeCommand(['build', '--flag1'], {
        executable: 'gow',
        cwd: '/root',
        env: { hello: 'world' },
      });
      expect(result.success).toBeTruthy();
      expect(child_process.execSync).toHaveBeenCalledWith(
        'gow build --flag1',
        expect.objectContaining({
          cwd: '/root',
          env: Object.assign(process.env, { hello: 'world' }),
        })
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Executing command: gow build --flag1'
      );
    });

    it('should handle error when spawning a go command', async () => {
      const spawnError = new Error('spawn error');
      jest.spyOn(child_process, 'execSync').mockImplementationOnce(() => {
        throw spawnError;
      });
      const result = await executeCommand(['version'], { cwd: '/workspace' });

      expect(result.success).toBeFalsy();
      expect(logger.error).toHaveBeenCalledWith(spawnError);
      expect(logger.info).toHaveBeenCalledWith('Executing command: go version');
    });
  });

  describe('Method: buildFlagIfEnabled', () => {
    it('should add a flag because enabled', () => {
      expect(buildFlagIfEnabled('--flag1', true)).toEqual(['--flag1']);
    });

    it('should not add a flag because not enabled', () => {
      expect(buildFlagIfEnabled('--flag1', false)).toEqual([]);
    });
  });

  describe('Method: buildStringFlagIfValid', () => {
    it('should add a flag because valid', () => {
      expect(buildStringFlagIfValid('--flag1', 'v1')).toEqual(['--flag1=v1']);
    });

    it('should not add a flag because not valid', () => {
      expect(buildStringFlagIfValid('--flag1')).toEqual([]);
    });
  });
});
