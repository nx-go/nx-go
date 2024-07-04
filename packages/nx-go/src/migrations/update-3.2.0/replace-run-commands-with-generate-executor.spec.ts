import * as devkit from '@nx/devkit';
import { ProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { TargetConfiguration } from 'nx/src/config/workspace-json-project-json';
import update from './replace-run-commands-with-generate-executor';

jest.mock('@nx/devkit');

describe('replace-run-commands-with-generate-executor migration', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  const createProjectMapWithTarget = (targets: {
    [targetName: string]: Partial<TargetConfiguration>;
  }) =>
    new Map([['api', { root: 'apps/api', targets } as ProjectConfiguration]]);

  it.each`
    endCommand     | cwd                | expectedArgs       | description
    ${''}          | ${'{projectRoot}'} | ${null}            | ${'command in the project root'}
    ${''}          | ${'apps/api'}      | ${null}            | ${'command in the project folder'}
    ${' ./...'}    | ${'{projectRoot}'} | ${['./...']}       | ${'one argument'}
    ${' ./... -p'} | ${'{projectRoot}'} | ${['./...', '-p']} | ${'two arguments'}
  `(
    'should update targets with $description',
    async ({ endCommand, cwd, expectedArgs }) => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest.spyOn(devkit, 'getProjects').mockReturnValue(
        createProjectMapWithTarget({
          generate: {
            executor: `nx:run-commands`,
            options: { command: `go generate${endCommand}`, cwd },
          },
        })
      );
      await update(tree);
      expect(updateConfig).toHaveBeenCalledWith(tree, 'api', expect.anything());
      expect(updateConfig.mock.calls[0][2].targets.generate).toEqual({
        executor: '@nx-go/nx-go:generate',
        options: expectedArgs != null ? { args: expectedArgs } : undefined,
      });
    }
  );

  it.each`
    options                                                                | description
    ${{ command: 'npm install' }}                                          | ${'another command'}
    ${{ command: 'go generate', cwd: 'other-folder/' }}                    | ${'a command in another folder'}
    ${{ command: 'go generate', cwd: '{projectRoot}', envFile: ['.env'] }} | ${'a complex use case'}
    ${{ cwd: '{projectRoot}', envFile: ['.env'] }}                         | ${'no command'}
  `('should not update targets with $description', async ({ options }) => {
    const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
    jest.spyOn(devkit, 'getProjects').mockReturnValue(
      createProjectMapWithTarget({
        generate: { executor: `nx:run-commands`, options },
      })
    );
    await update(tree);
    expect(updateConfig).not.toHaveBeenCalled();
  });

  it('should not update if there is no target', async () => {
    const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
    jest
      .spyOn(devkit, 'getProjects')
      .mockReturnValue(createProjectMapWithTarget(null));
    await update(tree);
    expect(updateConfig).not.toHaveBeenCalled();
  });
});
