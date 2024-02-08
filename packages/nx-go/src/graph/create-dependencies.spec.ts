import { CreateDependenciesContext, ProjectConfiguration } from '@nx/devkit';
import { execSync } from 'child_process';
import { ProjectFileMap } from 'nx/src/config/project-graph';
import { createDependencies } from './create-dependencies';

jest.mock('@nx/devkit', () => ({
  DependencyType: { static: 'static' },
  workspaceRoot: '/tmp/proj',
}));
jest.mock('child_process', () => ({
  execSync: jest
    .fn()
    .mockReturnValue(
      '{ "Path": "proj/api", "Dir": "/tmp/proj/apps/api" }\n{ "Path": "proj/datalayer", "Dir": "/tmp/proj/libs/data-layer" }'
    ),
}));
jest.mock('fs', () => ({
  readFileSync: jest
    .fn()
    .mockReturnValue('import (\n\t"fmt"\n\t"proj/datalayer"\n)'),
}));
jest.mock('../utils', () => ({
  parseGoList: jest.fn().mockReturnValue(['"fmt"', 'data "proj/datalayer"']),
}));

describe('Create dependencies', () => {
  const projects: Record<string, ProjectConfiguration> = {
    api: { root: 'apps/api' },
    datalayer: { root: 'libs/data-layer' },
  };
  const projectFileMap: ProjectFileMap = {
    api: [
      { file: 'api.go', hash: '' },
      { file: 'config.go', hash: '' },
      { file: 'config.yml', hash: '' },
    ],
  };
  const validContext = {
    filesToProcess: { projectFileMap, nonProjectFiles: [] },
    projects: projects,
  } as CreateDependenciesContext;

  afterEach(() => jest.resetAllMocks());

  it('should create dependencies', async () => {
    const dependencies = await createDependencies(null, validContext);
    expect(dependencies).toEqual([
      {
        source: 'api',
        target: 'datalayer',
        type: 'static',
        sourceFile: 'api.go',
      },
      {
        source: 'api',
        target: 'datalayer',
        type: 'static',
        sourceFile: 'config.go',
      },
    ]);
  });

  describe('Go modules', () => {
    it('should not compute Go if there is no file to process', async () => {
      const dependencies = await createDependencies(null, {
        filesToProcess: { projectFileMap: {}, nonProjectFiles: [] },
      } as CreateDependenciesContext);
      expect(execSync).not.toHaveBeenCalled();
      expect(dependencies).toEqual([]);
    });

    it('should compute Go modules but there is no', async () => {
      (execSync as jest.Mock).mockReturnValueOnce('');
      const dependencies = await createDependencies(null, validContext);
      expect(execSync).toHaveBeenCalledWith(
        'go list -m -json',
        expect.objectContaining({ cwd: '/tmp/proj' })
      );
      expect(dependencies).toEqual([]);
    });

    it('should throw an error if Go modules cannot be computed', async () => {
      (execSync as jest.Mock).mockReturnValueOnce(null);
      await expect(createDependencies(null, validContext)).rejects.toThrow(
        'Cannot get list of Go modules'
      );
    });
  });
});
