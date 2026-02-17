import { CreateNodesContextV2 } from '@nx/devkit';
import { shouldCreateAirTarget } from '../utils';
import { createNodesV2 } from './create-nodes-v2';
import { hasMainPackage } from './create-nodes/has-main-package';

jest.mock('./create-nodes/has-main-package');
jest.mock('../utils');

const mockedHasMainPackage = jest.mocked(hasMainPackage);
const mockedShouldCreateAirTarget = jest.mocked(shouldCreateAirTarget);

describe('Create nodes V2', () => {
  let context: CreateNodesContextV2;

  beforeEach(() => {
    context = {
      workspaceRoot: '/workspace',
      nxJsonConfiguration: {},
    };
    jest.clearAllMocks();
    // Default: no air setup
    mockedShouldCreateAirTarget.mockReturnValue(false);
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
                  generate: {
                    executor: '@nx-go/nx-go:generate',
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
                  generate: {
                    executor: '@nx-go/nx-go:generate',
                    cache: true,
                  },
                },
              },
            },
          },
        ],
      ]);

      const targets = result[0][1].projects?.['libs/utils'].targets;
      expect(targets).toBeDefined();
      expect(targets!.build).toBeUndefined();
      expect(targets!.serve).toBeUndefined();
    });

    it('should use custom target names from options', async () => {
      mockedHasMainPackage.mockReturnValue(true);

      const options = {
        buildTargetName: 'custom-build',
        testTargetName: 'custom-test',
        lintTargetName: 'custom-lint',
        tidyTargetName: 'custom-tidy',
        serveTargetName: 'custom-serve',
        generateTargetName: 'custom-generate',
      };
      const result = await createNodesV2[1](
        ['apps/myapp/go.mod'],
        options,
        context
      );

      const targets = result[0][1].projects?.['apps/myapp'].targets;
      expect(targets).toBeDefined();
      expect(targets!['custom-build']).toBeDefined();
      expect(targets!['custom-serve']).toBeDefined();
      expect(targets!['custom-test']).toBeDefined();
      expect(targets!['custom-lint']).toBeDefined();
      expect(targets!['custom-tidy']).toBeDefined();
      expect(targets!['custom-generate']).toBeDefined();
    });

    it('should also create nodes for go.mod at workspace root', async () => {
      const result = await createNodesV2[1](['./go.mod'], {}, context);
      const rootProject = result[0][1].projects?.['.'];
      expect(rootProject).toBeDefined();
      expect(rootProject!.root).toBe('.');
      expect(rootProject!.name).toBeUndefined();
    });

    it('should use project name from last path segment', async () => {
      mockedHasMainPackage.mockReturnValue(false);

      const result = await createNodesV2[1](['apps/api/go.mod'], {}, context);

      expect(result[0][1].projects?.['apps/api'].name).toBe('api');
    });

    describe('Air target', () => {
      it('should create air target with default name when config exists and air is available', async () => {
        mockedHasMainPackage.mockReturnValue(true);
        mockedShouldCreateAirTarget.mockReturnValue(true);

        const result = await createNodesV2[1](
          ['apps/myapp/go.mod'],
          {},
          context
        );

        const targets = result[0][1].projects?.['apps/myapp'].targets;
        expect(targets).toBeDefined();
        expect(targets!['serve:air']).toBeDefined();
        expect(targets!['serve:air']?.executor).toBe('@nx-go/nx-go:serve-air');
      });

      it('should use custom target name when specified', async () => {
        mockedHasMainPackage.mockReturnValue(true);
        mockedShouldCreateAirTarget.mockReturnValue(true);

        const options = {
          serveAirTargetName: 'air',
        };
        const result = await createNodesV2[1](
          ['apps/myapp/go.mod'],
          options,
          context
        );

        const targets = result[0][1].projects?.['apps/myapp'].targets;
        expect(targets).toBeDefined();
        expect(targets!['air']).toBeDefined();
        expect(targets!['air']?.executor).toBe('@nx-go/nx-go:serve-air');
        expect(targets!['serve:air']).toBeUndefined();
      });

      it('should not create air target when air setup is not available', async () => {
        mockedHasMainPackage.mockReturnValue(true);
        mockedShouldCreateAirTarget.mockReturnValue(false);

        const result = await createNodesV2[1](
          ['apps/myapp/go.mod'],
          {},
          context
        );

        const targets = result[0][1].projects?.['apps/myapp'].targets;
        expect(targets).toBeDefined();
        expect(targets!['serve:air']).toBeUndefined();
      });

      it('should not create air target for libraries', async () => {
        mockedHasMainPackage.mockReturnValue(false);
        mockedShouldCreateAirTarget.mockReturnValue(true);

        const result = await createNodesV2[1](
          ['libs/utils/go.mod'],
          {},
          context
        );

        const targets = result[0][1].projects?.['libs/utils'].targets;
        expect(targets).toBeDefined();
        expect(targets!['serve:air']).toBeUndefined();
      });
    });
  });
});
