const normalizeOptions = {
  name: 'data-access',
  moduleName: 'dataaccess',
  projectName: 'data-access',
  projectRoot: 'libs/data-access',
  projectType: 'library',
  parsedTags: ['data', 'data-access'],
};

import type { Tree } from '@nx/devkit';
import * as nxDevkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { join } from 'path';
import * as shared from '../../utils';
import libraryGenerator, { defaultTargets } from './generator';
import type { LibraryGeneratorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  addProjectConfiguration: jest.fn(),
  updateProjectConfiguration: jest.fn(),
  formatFiles: jest.fn(),
  generateFiles: jest.fn(),
}));
jest.mock('../../utils', () => ({
  addGoWorkDependency: jest.fn(),
  createGoMod: jest.fn(),
  isGoWorkspace: jest.fn().mockReturnValue(false),
  normalizeOptions: jest.fn().mockImplementation((_, { skipFormat }) => ({
    ...normalizeOptions,
    skipFormat,
  })),
}));

describe('library generator', () => {
  let tree: Tree;
  const options: LibraryGeneratorSchema = { name: 'data-access' };

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  it('should write project configuration', async () => {
    await libraryGenerator(tree, options);
    expect(nxDevkit.addProjectConfiguration).toHaveBeenCalledWith(
      tree,
      'data-access',
      {
        root: 'libs/data-access',
        name: 'data-access',
        projectType: 'library',
        sourceRoot: 'libs/data-access',
        targets: defaultTargets,
        tags: ['data', 'data-access'],
      }
    );
    expect(nxDevkit.updateProjectConfiguration).not.toHaveBeenCalled();
  });

  it('should generate files', async () => {
    await libraryGenerator(tree, options);
    expect(nxDevkit.generateFiles).toHaveBeenCalledWith(
      tree,
      join(__dirname, './files'),
      'libs/data-access',
      expect.objectContaining({ ...normalizeOptions, className: 'DataAccess' })
    );
  });

  it('should create Go mod for project if in a Go workspace', async () => {
    jest.spyOn(shared, 'isGoWorkspace').mockReturnValueOnce(true);
    await libraryGenerator(tree, options);
    expect(shared.createGoMod).toHaveBeenCalledWith(
      tree,
      'libs/data-access',
      'libs/data-access'
    );
  });

  it('should not create Go mod for project if not in a Go workspace', async () => {
    await libraryGenerator(tree, options);
    expect(shared.createGoMod).not.toHaveBeenCalled();
  });

  it('should add Go work dependency if in a Go workspace', async () => {
    jest.spyOn(shared, 'isGoWorkspace').mockReturnValueOnce(true);
    await libraryGenerator(tree, options);
    expect(shared.addGoWorkDependency).toHaveBeenCalledWith(
      tree,
      'libs/data-access'
    );
  });

  it('should add tidy executor for project if in a Go workspace', async () => {
    jest.spyOn(shared, 'isGoWorkspace').mockReturnValueOnce(true);
    await libraryGenerator(tree, options);
    expect(nxDevkit.updateProjectConfiguration).toHaveBeenCalledWith(
      tree,
      'data-access',
      {
        root: 'libs/data-access',
        name: 'data-access',
        projectType: 'library',
        sourceRoot: 'libs/data-access',
        targets: {
          ...defaultTargets,
          tidy: {
            executor: '@nx-go/nx-go:tidy',
          },
        },
        tags: ['data', 'data-access'],
      }
    );
  });

  it('should not add Go work dependency if not in a Go workspace', async () => {
    await libraryGenerator(tree, options);
    expect(shared.addGoWorkDependency).not.toHaveBeenCalled();
  });

  it('should format files', async () => {
    await libraryGenerator(tree, options);
    expect(nxDevkit.formatFiles).toHaveBeenCalledWith(tree);
  });

  it('should not format files if skipped', async () => {
    await libraryGenerator(tree, { ...options, skipFormat: true });
    expect(nxDevkit.formatFiles).not.toHaveBeenCalled();
  });
});
