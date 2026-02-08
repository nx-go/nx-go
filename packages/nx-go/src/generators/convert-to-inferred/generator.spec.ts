import type { ProjectGraph, Tree } from '@nx/devkit';
import * as devkit from '@nx/devkit';
import { migrateProjectExecutorsToPlugin } from '@nx/devkit/src/generators/plugin-migrations/executor-to-plugin-migrator';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import convertToInferredGenerator from './generator';

jest.mock('@nx/devkit');
jest.mock(
  '@nx/devkit/src/generators/plugin-migrations/executor-to-plugin-migrator',
  () => ({
    ...jest.requireActual(
      '@nx/devkit/src/generators/plugin-migrations/executor-to-plugin-migrator'
    ),
    migrateProjectExecutorsToPlugin: jest.fn(),
  })
);

const mockedMigrateProjectExecutorsToPlugin = jest.mocked(
  migrateProjectExecutorsToPlugin
);
const mockedCreateProjectGraphAsync = jest.mocked(
  devkit.createProjectGraphAsync
);

describe('convert-to-inferred generator', () => {
  let tree: Tree;
  let projectGraph: ProjectGraph;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    projectGraph = {
      nodes: {},
      dependencies: {},
    };
    mockedCreateProjectGraphAsync.mockResolvedValue(projectGraph);
  });
  afterEach(() => jest.clearAllMocks());

  it('should call migrateProjectExecutorsToPlugin with correct parameters', async () => {
    mockedMigrateProjectExecutorsToPlugin.mockResolvedValue(
      new Map([['project1', {}]])
    );

    await convertToInferredGenerator(tree, {});

    expect(migrateProjectExecutorsToPlugin).toHaveBeenCalledWith(
      tree,
      projectGraph,
      '@nx-go/nx-go',
      expect.anything(), // createNodesV2
      {
        buildTargetName: 'build',
        serveTargetName: 'serve',
        testTargetName: 'test',
        lintTargetName: 'lint',
        tidyTargetName: 'tidy',
      },
      expect.arrayContaining([
        expect.objectContaining({
          executors: ['@nx-go/nx-go:build'],
        }),
        expect.objectContaining({
          executors: ['@nx-go/nx-go:serve'],
        }),
        expect.objectContaining({
          executors: ['@nx-go/nx-go:test'],
        }),
        expect.objectContaining({
          executors: ['@nx-go/nx-go:lint'],
        }),
        expect.objectContaining({
          executors: ['@nx-go/nx-go:tidy'],
        }),
      ]),
      undefined
    );
  });

  it('should pass project option to migrateProjectExecutorsToPlugin', async () => {
    mockedMigrateProjectExecutorsToPlugin.mockResolvedValue(
      new Map([['project1', {}]])
    );

    await convertToInferredGenerator(tree, { project: 'my-project' });

    expect(migrateProjectExecutorsToPlugin).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'my-project'
    );
  });

  it('should throw NoTargetsToMigrateError when no projects are migrated', async () => {
    mockedMigrateProjectExecutorsToPlugin.mockResolvedValue(new Map());

    await expect(convertToInferredGenerator(tree, {})).rejects.toThrow(
      'Could not find any targets to migrate.'
    );
  });

  it('should skip formatting when skipFormat is true', async () => {
    const formatFilesSpy = jest.spyOn(devkit, 'formatFiles');

    mockedMigrateProjectExecutorsToPlugin.mockResolvedValue(
      new Map([['project1', {}]])
    );

    await convertToInferredGenerator(tree, { skipFormat: true });

    expect(formatFilesSpy).not.toHaveBeenCalled();
  });

  it('should format files by default', async () => {
    const formatFilesSpy = jest.spyOn(devkit, 'formatFiles');

    mockedMigrateProjectExecutorsToPlugin.mockResolvedValue(
      new Map([['project1', {}]])
    );

    await convertToInferredGenerator(tree, {});

    expect(formatFilesSpy).toHaveBeenCalledWith(tree);
  });
});
