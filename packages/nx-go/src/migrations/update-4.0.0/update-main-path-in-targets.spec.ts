import * as devkit from '@nx/devkit';
import { ProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { TargetConfiguration } from 'nx/src/config/workspace-json-project-json';
import update from './update-main-path-in-targets';

jest.mock('@nx/devkit');

describe('update-main-path-in-targets migration', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  const createProjectMapWithTarget = (
    projectName: string,
    projectRoot: string,
    targets: {
      [targetName: string]: Partial<TargetConfiguration>;
    }
  ) =>
    new Map<string, ProjectConfiguration>([
      [projectName, { root: projectRoot, targets }],
    ]);

  describe('path transformations', () => {
    it.each`
      executor                | currentPath                    | projectRoot       | expectedPath     | description
      ${'@nx-go/nx-go:build'} | ${'{projectRoot}/main.go'}     | ${'apps/api'}     | ${'main.go'}     | ${'build executor with placeholder path'}
      ${'@nx-go/nx-go:build'} | ${'apps/api/main.go'}          | ${'apps/api'}     | ${'main.go'}     | ${'build executor with absolute path'}
      ${'@nx-go/nx-go:build'} | ${'apps/backend/cmd/main.go'}  | ${'apps/backend'} | ${'cmd/main.go'} | ${'build executor with nested path'}
      ${'@nx-go/nx-go:build'} | ${'{projectRoot}/cmd/main.go'} | ${'apps/backend'} | ${'cmd/main.go'} | ${'build executor with placeholder nested path'}
      ${'@nx-go/nx-go:serve'} | ${'{projectRoot}/main.go'}     | ${'apps/api'}     | ${'main.go'}     | ${'serve executor with placeholder path'}
      ${'@nx-go/nx-go:serve'} | ${'apps/api/main.go'}          | ${'apps/api'}     | ${'main.go'}     | ${'serve executor with absolute path'}
      ${'@nx-go/nx-go:build'} | ${'some/path/main.go'}         | ${''}             | ${'main.go'}     | ${'workspace root project'}
    `(
      'should update $description',
      async ({ executor, currentPath, projectRoot, expectedPath }) => {
        const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
        jest.spyOn(devkit, 'getProjects').mockReturnValue(
          createProjectMapWithTarget('api', projectRoot, {
            target: {
              executor,
              options: { main: currentPath },
            },
          })
        );
        await update(tree);
        expect(updateConfig).toHaveBeenCalledWith(
          tree,
          'api',
          expect.anything()
        );
        expect(updateConfig.mock.calls[0][2].targets.target.options.main).toBe(
          expectedPath
        );
      }
    );
  });

  describe('no update scenarios', () => {
    it('should not update if main path is already relative', async () => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest.spyOn(devkit, 'getProjects').mockReturnValue(
        createProjectMapWithTarget('api', 'apps/api', {
          build: {
            executor: '@nx-go/nx-go:build',
            options: { main: 'main.go' },
          },
        })
      );
      await update(tree);
      expect(updateConfig).not.toHaveBeenCalled();
    });

    it('should not update if executor is not nx-go', async () => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest.spyOn(devkit, 'getProjects').mockReturnValue(
        createProjectMapWithTarget('api', 'apps/api', {
          build: {
            executor: 'nx:run-commands',
            options: { main: '{projectRoot}/main.go' },
          },
        })
      );
      await update(tree);
      expect(updateConfig).not.toHaveBeenCalled();
    });

    it('should not update if main option is not defined', async () => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest.spyOn(devkit, 'getProjects').mockReturnValue(
        createProjectMapWithTarget('api', 'apps/api', {
          build: {
            executor: '@nx-go/nx-go:build',
            options: {},
          },
        })
      );
      await update(tree);
      expect(updateConfig).not.toHaveBeenCalled();
    });

    it('should not update if there are no targets', async () => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest
        .spyOn(devkit, 'getProjects')
        .mockReturnValue(
          new Map([['api', { root: 'apps/api' } as ProjectConfiguration]])
        );
      await update(tree);
      expect(updateConfig).not.toHaveBeenCalled();
    });
  });

  describe('multiple targets', () => {
    it('should update all nx-go targets regardless of name', async () => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest.spyOn(devkit, 'getProjects').mockReturnValue(
        createProjectMapWithTarget('api', 'apps/api', {
          build: {
            executor: '@nx-go/nx-go:build',
            options: { main: '{projectRoot}/main.go' },
          },
          serve: {
            executor: '@nx-go/nx-go:serve',
            options: { main: 'apps/api/main.go' },
          },
          'build:prod': {
            executor: '@nx-go/nx-go:build',
            options: { main: 'apps/api/cmd/main.go' },
          },
          start: {
            executor: '@nx-go/nx-go:serve',
            options: { main: '{projectRoot}/server.go' },
          },
        })
      );
      await update(tree);
      expect(updateConfig).toHaveBeenCalledWith(tree, 'api', expect.anything());
      expect(updateConfig.mock.calls[0][2].targets.build.options.main).toBe(
        'main.go'
      );
      expect(updateConfig.mock.calls[0][2].targets.serve.options.main).toBe(
        'main.go'
      );
      expect(
        updateConfig.mock.calls[0][2].targets['build:prod'].options.main
      ).toBe('cmd/main.go');
      expect(updateConfig.mock.calls[0][2].targets.start.options.main).toBe(
        'server.go'
      );
    });
  });

  describe('multiple projects', () => {
    it('should update multiple projects', async () => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest.spyOn(devkit, 'getProjects').mockReturnValue(
        new Map<string, ProjectConfiguration>([
          [
            'api',
            {
              root: 'apps/api',
              targets: {
                build: {
                  executor: '@nx-go/nx-go:build',
                  options: { main: '{projectRoot}/main.go' },
                },
              },
            },
          ],
          [
            'backend',
            {
              root: 'apps/backend',
              targets: {
                build: {
                  executor: '@nx-go/nx-go:build',
                  options: { main: 'apps/backend/main.go' },
                },
              },
            },
          ],
        ])
      );
      await update(tree);
      expect(updateConfig).toHaveBeenCalledTimes(2);
      expect(updateConfig).toHaveBeenCalledWith(tree, 'api', expect.anything());
      expect(updateConfig).toHaveBeenCalledWith(
        tree,
        'backend',
        expect.anything()
      );
    });
  });
});
