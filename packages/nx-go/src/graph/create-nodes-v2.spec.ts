import { CreateNodesContextV2 } from '@nx/devkit';
import { createNodesV2 } from './create-nodes-v2';
import { hasMainPackage } from './create-nodes/has-main-package';

jest.mock('./create-nodes/has-main-package');

const mockedHasMainPackage = jest.mocked(hasMainPackage);

describe('Create nodes V2', () => {
  let context: CreateNodesContextV2;

  beforeEach(() => {
    context = {
      workspaceRoot: '/workspace',
      nxJsonConfiguration: {},
    };
    jest.clearAllMocks();
  });

  it('should compute all go.mod files', () => {
    expect(createNodesV2[0]).toEqual('**/go.mod');
  });

  describe('with inferred tasks', () => {
    it('should create inferred tasks for an application with package main', async () => {
      mockedHasMainPackage.mockReturnValue(true);

      const result = await createNodesV2[1](['apps/api/go.mod'], {}, context);

      expect(result).toMatchObject([
        [
          'apps/api/go.mod',
          {
            projects: {
              'apps/api': {
                name: 'api',
                root: 'apps/api',
                projectType: 'application',
                targets: {
                  build: {
                    executor: '@nx-go/nx-go:build',
                    cache: true,
                  },
                  serve: {
                    executor: '@nx-go/nx-go:serve',
                  },
                  test: {
                    executor: '@nx-go/nx-go:test',
                    cache: true,
                  },
                  lint: {
                    executor: '@nx-go/nx-go:lint',
                    cache: true,
                  },
                  tidy: {
                    executor: '@nx-go/nx-go:tidy',
                    cache: true,
                  },
                },
              },
            },
          },
        ],
      ]);
    });

    it('should create inferred tasks for a library without package main', async () => {
      mockedHasMainPackage.mockReturnValue(false);

      const result = await createNodesV2[1](['libs/utils/go.mod'], {}, context);

      expect(result).toMatchObject([
        [
          'libs/utils/go.mod',
          {
            projects: {
              'libs/utils': {
                name: 'utils',
                root: 'libs/utils',
                projectType: 'library',
                targets: {
                  test: {
                    executor: '@nx-go/nx-go:test',
                    cache: true,
                  },
                  lint: {
                    executor: '@nx-go/nx-go:lint',
                    cache: true,
                  },
                  tidy: {
                    executor: '@nx-go/nx-go:tidy',
                    cache: true,
                  },
                },
              },
            },
          },
        ],
      ]);

      const targets = result[0][1].projects['libs/utils'].targets;
      expect(targets.build).toBeUndefined();
      expect(targets.serve).toBeUndefined();
    });

    it('should use custom target names from options', async () => {
      mockedHasMainPackage.mockReturnValue(true);

      const options = {
        buildTargetName: 'custom-build',
        testTargetName: 'custom-test',
        lintTargetName: 'custom-lint',
        tidyTargetName: 'custom-tidy',
        serveTargetName: 'custom-serve',
      };
      const result = await createNodesV2[1](
        ['apps/myapp/go.mod'],
        options,
        context
      );

      const targets = result[0][1].projects['apps/myapp'].targets;
      expect(targets['custom-build']).toBeDefined();
      expect(targets['custom-serve']).toBeDefined();
      expect(targets['custom-test']).toBeDefined();
      expect(targets['custom-lint']).toBeDefined();
      expect(targets['custom-tidy']).toBeDefined();
    });

    it('should not create nodes for go.mod at workspace root', async () => {
      const result = await createNodesV2[1](['./go.mod'], {}, context);

      expect(result).toEqual([['./go.mod', {}]]);
      expect(mockedHasMainPackage).not.toHaveBeenCalled();
    });

    it('should use project name from last path segment', async () => {
      mockedHasMainPackage.mockReturnValue(false);

      const result = await createNodesV2[1](['apps/api/go.mod'], {}, context);

      expect(result[0][1].projects['apps/api'].name).toBe('api');
    });
  });
});
