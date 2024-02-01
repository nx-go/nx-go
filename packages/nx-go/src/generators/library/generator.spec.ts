const normalizeOptions = {
  name: 'data-access',
  projectName: 'data-access',
  projectRoot: 'libs/data-access',
  projectType: 'library',
  parsedTags: ['data', 'data-access'],
};

import type { Tree } from '@nx/devkit';
import * as nxDevkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as shared from '../shared';
import libraryGenerator from './generator';
import type { LibraryGeneratorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  addProjectConfiguration: jest.fn(),
  formatFiles: jest.fn(),
  generateFiles: jest.fn(),
}));
jest.mock('../shared', () => ({
  addNxPlugin: jest.fn(),
  createGoMod: jest.fn(),
  normalizeOptions: jest.fn().mockReturnValue(normalizeOptions),
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
        projectType: 'library',
        sourceRoot: 'libs/data-access',
        targets: expect.anything(),
        tags: ['data', 'data-access'],
      }
    );
  });

  it('should generate files', async () => {
    await libraryGenerator(tree, options);
    expect(nxDevkit.generateFiles).toHaveBeenCalledWith(
      tree,
      nxDevkit.joinPathFragments(__dirname, './files'),
      'libs/data-access',
      expect.objectContaining({
        ...normalizeOptions,
        packageName: 'data_access',
        className: 'DataAccess',
      })
    );
  });

  it('should create go mod', async () => {
    await libraryGenerator(tree, options);
    expect(shared.createGoMod).toHaveBeenCalledWith(tree, normalizeOptions);
  });

  it('should not create go mod if skipped', async () => {
    await libraryGenerator(tree, { ...options, skipGoMod: true });
    expect(shared.createGoMod).not.toHaveBeenCalled();
  });

  it('should add nx plugin', async () => {
    await libraryGenerator(tree, options);
    expect(shared.addNxPlugin).toHaveBeenCalledWith(tree);
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
