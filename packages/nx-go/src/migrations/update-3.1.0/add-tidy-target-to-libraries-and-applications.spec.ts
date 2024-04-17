import * as devkit from '@nx/devkit';
import { ProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { TargetConfiguration } from 'nx/src/config/workspace-json-project-json';
import update from './add-tidy-target-to-libraries-and-applications';

jest.mock('@nx/devkit');

describe('update-executors-options migration', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  const createProjectMapWithTarget = (target: Partial<TargetConfiguration>) =>
    new Map([
      ['api', { root: '', targets: { target } } as ProjectConfiguration],
    ]);

  it('should update application / library targets with @nx-go/nx-go:tidy', async () => {
    const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
    jest
      .spyOn(devkit, 'getProjects')
      .mockReturnValue(createProjectMapWithTarget({}));
    await update(tree);
    expect(updateConfig).toHaveBeenCalledWith(tree, 'api', expect.anything());
    expect(updateConfig.mock.calls[0][2].targets.tidy).toEqual({
      executor: '@nx-go/nx-go:tidy',
    });
  });

  it('should update application / library target with @nx-go/nx-go:tidy when target already exist with custom command', async () => {
    const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
    jest.spyOn(devkit, 'getProjects').mockReturnValue(
      createProjectMapWithTarget({
        executor: 'nx:run-commands',
      })
    );
    await update(tree);
    expect(updateConfig).toHaveBeenCalledWith(tree, 'api', expect.anything());
    expect(updateConfig.mock.calls[0][2].targets.tidy).toEqual({
      executor: '@nx-go/nx-go:tidy',
    });
  });
});
