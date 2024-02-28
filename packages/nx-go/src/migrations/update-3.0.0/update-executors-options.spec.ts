import * as devkit from '@nx/devkit';
import { ProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { TargetConfiguration } from 'nx/src/config/workspace-json-project-json';
import update from './update-executors-options';

jest.mock('@nx/devkit');

describe('update-executors-options migration', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  const createProjectMapWithTarget = (target: Partial<TargetConfiguration>) =>
    new Map([
      ['api', { root: '', targets: { target } } as ProjectConfiguration],
    ]);

  it('should update options of @nx-go/nx-go:lint executor', async () => {
    const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
    jest.spyOn(devkit, 'getProjects').mockReturnValue(
      createProjectMapWithTarget({
        executor: '@nx-go/nx-go:lint',
        options: { linter: 'revive', args: '-config ./revive.toml' },
      })
    );
    await update(tree);
    expect(updateConfig).toHaveBeenCalledWith(tree, 'api', expect.anything());
    expect(updateConfig.mock.calls[0][2].targets.target.options).toEqual({
      linter: 'revive',
      args: ['-config', './revive.toml'],
    });
  });

  it('should update options of @nx-go/nx-go:serve executor', async () => {
    const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
    jest.spyOn(devkit, 'getProjects').mockReturnValue(
      createProjectMapWithTarget({
        executor: '@nx-go/nx-go:serve',
        options: { arguments: ['--host', '0.0.0.0'] },
      })
    );
    await update(tree);
    expect(updateConfig).toHaveBeenCalledWith(tree, 'api', expect.anything());
    expect(updateConfig.mock.calls[0][2].targets.target.options).toEqual({
      args: ['--host', '0.0.0.0'],
    });
  });

  it.each`
    executor                | options                                   | description
    ${'@nx-go/nx-go:lint'}  | ${{ args: ['-config', './revive.toml'] }} | ${'lint executor has already new args format'}
    ${'@nx-go/nx-go:lint'}  | ${{ linter: 'revive' }}                   | ${'lint executor does not have args option'}
    ${'@nx-go/nx-go:lint'}  | ${null}                                   | ${'lint executor does not have option'}
    ${'@nx-go/nx-go:serve'} | ${{ cmd: 'go' }}                          | ${'serve executor does not have arguments option'}
    ${'@nx-go/nx-go:serve'} | ${null}                                   | ${'serve executor does not have option'}
    ${'invalid'}            | ${{}}                                     | ${'there is no valid executor'}
  `('should do nothing if $description', async ({ executor, options }) => {
    jest
      .spyOn(devkit, 'getProjects')
      .mockReturnValue(createProjectMapWithTarget({ executor, options }));
    await update(tree);
    expect(devkit.updateProjectConfiguration).not.toHaveBeenCalled();
  });
});
