import {
  addProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { GO_MOD_FILE, GO_PROJECT_INPUTS } from '../../constants';
import update from './configure-target-caching-and-named-inputs';

describe('configure-target-caching-and-named-inputs migration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('sharedGlobals cleanup', () => {
    it.each`
      description                  | initialSharedGlobals
      ${'go.work only'}            | ${['{workspaceRoot}/go.work']}
      ${'go.mod only'}             | ${['{workspaceRoot}/go.mod']}
      ${'both go.work and go.mod'} | ${['{workspaceRoot}/go.work', '{workspaceRoot}/go.mod']}
    `(
      'should remove $description from sharedGlobals',
      async ({ initialSharedGlobals }) => {
        // Arrange
        const nxJson = readNxJson(tree);
        nxJson.namedInputs = {
          sharedGlobals: [
            '{workspaceRoot}/package.json',
            ...initialSharedGlobals,
          ],
        };
        updateNxJson(tree, nxJson);

        // Act
        await update(tree);

        // Assert
        const updatedNxJson = readNxJson(tree);
        expect(updatedNxJson.namedInputs.sharedGlobals).toEqual([
          '{workspaceRoot}/package.json',
        ]);
      }
    );

    it('should not modify sharedGlobals if no Go files present', async () => {
      // Arrange
      const nxJson = readNxJson(tree);
      nxJson.namedInputs = {
        sharedGlobals: ['{workspaceRoot}/package.json'],
      };
      updateNxJson(tree, nxJson);

      // Act
      await update(tree);

      // Assert
      const updatedNxJson = readNxJson(tree);
      expect(updatedNxJson.namedInputs.sharedGlobals).toEqual([
        '{workspaceRoot}/package.json',
      ]);
    });

    it('should handle missing namedInputs', async () => {
      // Arrange
      const nxJson = readNxJson(tree);
      delete nxJson.namedInputs;
      updateNxJson(tree, nxJson);

      // Act & Assert - should not throw
      await expect(update(tree)).resolves.not.toThrow();
    });

    it('should handle missing sharedGlobals', async () => {
      // Arrange
      const nxJson = readNxJson(tree);
      nxJson.namedInputs = {};
      updateNxJson(tree, nxJson);

      // Act & Assert - should not throw
      await expect(update(tree)).resolves.not.toThrow();
    });
  });

  describe('golang named input', () => {
    it('should add golang named input if it does not exist', async () => {
      // Arrange - default workspace has no golang input

      // Act
      await update(tree);

      // Assert
      const nxJson = readNxJson(tree);
      expect(nxJson.namedInputs.golang).toEqual(GO_PROJECT_INPUTS);
    });

    it('should not override existing golang named input', async () => {
      // Arrange
      const nxJson = readNxJson(tree);
      nxJson.namedInputs = { golang: ['custom-input'] };
      updateNxJson(tree, nxJson);

      // Act
      await update(tree);

      // Assert
      const updatedNxJson = readNxJson(tree);
      expect(updatedNxJson.namedInputs.golang).toEqual(['custom-input']);
    });

    it('should create namedInputs if it does not exist', async () => {
      // Arrange
      const nxJson = readNxJson(tree);
      delete nxJson.namedInputs;
      updateNxJson(tree, nxJson);

      // Act
      await update(tree);

      // Assert
      const updatedNxJson = readNxJson(tree);
      expect(updatedNxJson.namedInputs).toBeDefined();
      expect(updatedNxJson.namedInputs.golang).toEqual(GO_PROJECT_INPUTS);
    });
  });

  describe('project target configuration', () => {
    beforeEach(() => {
      // Create test projects
      addProjectConfiguration(tree, 'go-app', {
        root: 'apps/go-app',
        targets: {
          build: {
            executor: '@nx-go/nx-go:build',
            options: {},
          },
          test: {
            executor: '@nx-go/nx-go:test',
            options: {},
          },
        },
      });

      addProjectConfiguration(tree, 'go-lib', {
        root: 'libs/go-lib',
        targets: {
          lint: {
            executor: '@nx-go/nx-go:lint',
            options: {},
          },
          tidy: {
            executor: '@nx-go/nx-go:tidy',
            options: {},
          },
        },
      });
    });

    it('should add cache: true to cacheable nx-go executors', async () => {
      // Act
      await update(tree);

      // Assert
      const goAppConfig = tree.read('apps/go-app/project.json', 'utf-8');
      const goAppProject = JSON.parse(goAppConfig);
      expect(goAppProject.targets.build.cache).toBe(true);
      expect(goAppProject.targets.test.cache).toBe(true);

      const goLibConfig = tree.read('libs/go-lib/project.json', 'utf-8');
      const goLibProject = JSON.parse(goLibConfig);
      expect(goLibProject.targets.lint.cache).toBe(true);
      expect(goLibProject.targets.tidy.cache).toBe(true);
    });

    it('should not add cache to serve executor', async () => {
      // Arrange
      addProjectConfiguration(tree, 'go-serve', {
        root: 'apps/go-serve',
        targets: {
          serve: { executor: '@nx-go/nx-go:serve', options: {} },
        },
      });

      // Act
      await update(tree);

      // Assert
      const config = tree.read('apps/go-serve/project.json', 'utf-8');
      const project = JSON.parse(config);
      expect(project.targets.serve.cache).toBeUndefined();
    });

    it('should add inputs: ["golang"] to nx-go targets', async () => {
      // Act
      await update(tree);

      // Assert
      const goAppConfig = tree.read('apps/go-app/project.json', 'utf-8');
      const goAppProject = JSON.parse(goAppConfig);
      expect(goAppProject.targets.build.inputs).toEqual(['golang']);
      expect(goAppProject.targets.test.inputs).toEqual(['golang']);

      const goLibConfig = tree.read('libs/go-lib/project.json', 'utf-8');
      const goLibProject = JSON.parse(goLibConfig);
      expect(goLibProject.targets.lint.inputs).toEqual(['golang']);
      expect(goLibProject.targets.tidy.inputs).toEqual(['golang']);
    });

    it('should add outputs', async () => {
      // Act
      await update(tree);

      // Assert
      const goAppConfig = tree.read('apps/go-app/project.json', 'utf-8');
      const goAppProject = JSON.parse(goAppConfig);
      expect(goAppProject.targets.build.outputs).toEqual([
        '{workspaceRoot}/dist/{projectRoot}*',
      ]);
      const goLibConfig = tree.read('libs/go-lib/project.json', 'utf-8');
      const goLibProject = JSON.parse(goLibConfig);
      expect(goLibProject.targets.tidy.outputs).toEqual([
        `{projectRoot}/${GO_MOD_FILE}`,
        '{projectRoot}/go.sum',
      ]);
    });

    it('should add continuous: true to serve executor', async () => {
      // Arrange
      addProjectConfiguration(tree, 'go-serve', {
        root: 'apps/go-serve',
        targets: {
          serve: { executor: '@nx-go/nx-go:serve' },
        },
      });

      // Act
      await update(tree);

      // Assert
      const config = tree.read('apps/go-serve/project.json', 'utf-8');
      const project = JSON.parse(config);
      expect(project.targets.serve.continuous).toBe(true);
    });

    it('should not override existing cache configuration', async () => {
      // Arrange
      addProjectConfiguration(tree, 'go-custom', {
        root: 'apps/go-custom',
        targets: {
          build: { executor: '@nx-go/nx-go:build', cache: false },
        },
      });

      // Act
      await update(tree);

      // Assert
      const config = tree.read('apps/go-custom/project.json', 'utf-8');
      const project = JSON.parse(config);
      expect(project.targets.build.cache).toBe(false);
    });

    it('should not override existing inputs configuration', async () => {
      // Arrange
      addProjectConfiguration(tree, 'go-custom', {
        root: 'apps/go-custom',
        targets: {
          build: { executor: '@nx-go/nx-go:build', inputs: ['custom-input'] },
        },
      });

      // Act
      await update(tree);

      // Assert
      const config = tree.read('apps/go-custom/project.json', 'utf-8');
      const project = JSON.parse(config);
      expect(project.targets.build.inputs).toEqual(['custom-input']);
    });

    it('should not override existing outputs configuration', async () => {
      // Arrange
      addProjectConfiguration(tree, 'go-custom', {
        root: 'apps/go-custom',
        targets: {
          tidy: { executor: '@nx-go/nx-go:tidy', outputs: ['custom-output'] },
        },
      });

      // Act
      await update(tree);

      // Assert
      const config = tree.read('apps/go-custom/project.json', 'utf-8');
      const project = JSON.parse(config);
      expect(project.targets.tidy.outputs).toEqual(['custom-output']);
    });

    it('should not override existing continuous configuration', async () => {
      // Arrange
      addProjectConfiguration(tree, 'go-custom', {
        root: 'apps/go-custom',
        targets: {
          serve: { executor: '@nx-go/nx-go:serve', continuous: false },
        },
      });

      // Act
      await update(tree);

      // Assert
      const config = tree.read('apps/go-custom/project.json', 'utf-8');
      const project = JSON.parse(config);
      expect(project.targets.serve.continuous).toBe(false);
    });

    it('should not modify non-nx-go executors', async () => {
      // Arrange
      addProjectConfiguration(tree, 'ts-app', {
        root: 'apps/ts-app',
        targets: {
          build: { executor: '@nx/webpack:build' },
        },
      });

      // Act
      await update(tree);

      // Assert
      const config = tree.read('apps/ts-app/project.json', 'utf-8');
      const project = JSON.parse(config);
      expect(project.targets.build.cache).toBeUndefined();
      expect(project.targets.build.inputs).toBeUndefined();
    });

    it('should handle projects with no targets', async () => {
      // Arrange
      addProjectConfiguration(tree, 'empty-project', {
        root: 'apps/empty-project',
      });

      // Act & Assert - should not throw
      await expect(update(tree)).resolves.not.toThrow();
    });

    it('should handle multiple nx-go projects', async () => {
      // Arrange
      addProjectConfiguration(tree, 'go-app-2', {
        root: 'apps/go-app-2',
        targets: {
          build: { executor: '@nx-go/nx-go:build' },
        },
      });

      // Act
      await update(tree);

      // Assert
      const goApp1Config = tree.read('apps/go-app/project.json', 'utf-8');
      const goApp1Project = JSON.parse(goApp1Config);
      expect(goApp1Project.targets.build.cache).toBe(true);
      expect(goApp1Project.targets.build.inputs).toEqual(['golang']);

      const goApp2Config = tree.read('apps/go-app-2/project.json', 'utf-8');
      const goApp2Project = JSON.parse(goApp2Config);
      expect(goApp2Project.targets.build.cache).toBe(true);
      expect(goApp2Project.targets.build.inputs).toEqual(['golang']);
    });
  });
});
