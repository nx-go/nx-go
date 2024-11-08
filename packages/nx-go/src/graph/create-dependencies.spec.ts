import * as nxDevkit from '@nx/devkit';
import {
  CreateDependenciesContext,
  DependencyType,
  ProjectConfiguration,
  RawProjectGraphDependency,
} from '@nx/devkit';
import { ProjectFileMap } from 'nx/src/config/project-graph';
import * as utils from '../utils';
import { createDependencies } from './create-dependencies';

jest.mock('@nx/devkit', () => ({
  DependencyType: { static: 'static' },
  workspaceRoot: '/tmp/proj',
}));
jest.mock('fs', () => ({
  readFileSync: jest
    .fn()
    .mockReturnValue('import (\n\t"fmt"\n\t"proj/datalayer"\n)'),
}));
jest.mock('../utils', () => ({
  getGoModules: jest
    .fn()
    .mockReturnValue(
      '{ "Path": "proj/api", "Dir": "/tmp/proj/apps/api" }\n' +
        '{ "Path": "proj/datalayer", "Dir": "/tmp/proj/libs/data-layer" }'
    ),
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

  const expectedDependencies: RawProjectGraphDependency[] = [
    {
      source: 'api',
      target: 'datalayer',
      type: DependencyType.static,
      sourceFile: 'api.go',
    },
    {
      source: 'api',
      target: 'datalayer',
      type: DependencyType.static,
      sourceFile: 'config.go',
    },
  ];

  afterEach(() => jest.clearAllMocks());

  it('should create dependencies', async () => {
    const dependencies = await createDependencies(null, validContext);
    expect(dependencies).toEqual(expectedDependencies);
  });

  it('should create dependencies on Windows', async () => {
    const oldWorkspace = nxDevkit.workspaceRoot;
    Object.defineProperty(nxDevkit, 'workspaceRoot', {
      value: 'C:\\tmp\\proj',
    });
    jest
      .spyOn(utils, 'getGoModules')
      .mockReturnValueOnce(
        '{ "Path": "proj/api", "Dir": "/tmp/proj/apps/api" }\n' +
          '{ "Path": "proj/datalayer", "Dir": "C:\\\\tmp\\\\proj\\\\libs\\\\data-layer" }'
      );
    const dependencies = await createDependencies(null, validContext);
    Object.defineProperty(nxDevkit, 'workspaceRoot', { value: oldWorkspace });
    expect(dependencies).toEqual(expectedDependencies);
  });

  describe('Go modules', () => {
    it('should not compute Go if there is no file to process', async () => {
      const dependencies = await createDependencies(null, {
        filesToProcess: { projectFileMap: {}, nonProjectFiles: [] },
      } as CreateDependenciesContext);
      expect(utils.getGoModules).not.toHaveBeenCalled();
      expect(dependencies).toEqual([]);
    });

    it('should compute Go modules but there is no', async () => {
      (utils.getGoModules as jest.Mock).mockReturnValueOnce('');
      const dependencies = await createDependencies(null, validContext);
      expect(utils.getGoModules).toHaveBeenCalledWith('/tmp/proj', false);
      expect(dependencies).toEqual([]);
    });

    it('should compute Go modules and fail silently if Go is not required', async () => {
      await createDependencies({ skipGoDependencyCheck: true }, validContext);
      expect(utils.getGoModules).toHaveBeenCalledWith('/tmp/proj', true);
    });

    it('should throw an error if Go modules cannot be computed', async () => {
      (utils.getGoModules as jest.Mock).mockReturnValueOnce(null);
      await expect(createDependencies(null, validContext)).rejects.toThrow(
        'Cannot get list of Go modules'
      );
    });
  });
});
