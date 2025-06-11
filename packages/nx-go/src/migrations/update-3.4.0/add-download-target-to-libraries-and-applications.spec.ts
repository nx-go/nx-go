import * as devkit from '@nx/devkit';
import { ProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { TargetConfiguration } from 'nx/src/config/workspace-json-project-json';
import update from './add-download-target-to-libraries-and-applications';
import { NX_PLUGIN_NAME } from '../../constants';
import * as goBridge from '../../utils/go-bridge';

jest.mock('@nx/devkit');

describe('add-download-target-to-libraries-and-applications migration', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  const createProjectMapWithTarget = (targets: {
    [targetName: string]: Partial<TargetConfiguration>;
  }) => new Map([['api', { root: '', targets } as ProjectConfiguration]]);

  describe('when go workspace', () => {
    beforeEach(() => {
      jest.spyOn(goBridge, 'isGoWorkspace').mockReturnValue(true);
    });

    it('should update application / library targets with @nx-go/nx-go:download', async () => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest.spyOn(devkit, 'getProjects').mockReturnValue(
        createProjectMapWithTarget({
          serve: {
            executor: `${NX_PLUGIN_NAME}:serve`,
          },
        })
      );
      await update(tree);
      expect(updateConfig).toHaveBeenCalledWith(tree, 'api', expect.anything());
      expect(updateConfig.mock.calls[0][2].targets.download).toEqual({
        executor: '@nx-go/nx-go:download',
      });
    });

    it('should update application / library target with @nx-go/nx-go:download when target already exist with custom command', async () => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest.spyOn(devkit, 'getProjects').mockReturnValue(
        createProjectMapWithTarget({
          serve: {
            executor: `${NX_PLUGIN_NAME}:serve`,
          },
          download: {
            executor: 'nx:run-commands',
          },
        })
      );
      await update(tree);
      expect(updateConfig).toHaveBeenCalledWith(tree, 'api', expect.anything());
      expect(updateConfig.mock.calls[0][2].targets.download).toEqual({
        executor: '@nx-go/nx-go:download',
      });
    });

    it('should not update application / library targets with @nx-go/nx-go:download when not a nx-go project', async () => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest.spyOn(devkit, 'getProjects').mockReturnValue(
        createProjectMapWithTarget({
          serve: {
            executor: `@angular:serve`,
          },
        })
      );
      await update(tree);
      expect(updateConfig).not.toHaveBeenCalled();
    });
  });

  describe('when not a go workspace', () => {
    beforeEach(() => {
      jest.spyOn(goBridge, 'isGoWorkspace').mockReturnValue(false);
    });

    it('should not update application / library targets with @nx-go/nx-go:download', async () => {
      const updateConfig = jest.spyOn(devkit, 'updateProjectConfiguration');
      jest.spyOn(devkit, 'getProjects').mockReturnValue(
        createProjectMapWithTarget({
          serve: {
            executor: `${NX_PLUGIN_NAME}:serve`,
          },
        })
      );
      await update(tree);
      expect(updateConfig).not.toHaveBeenCalled();
    });
  });
});
