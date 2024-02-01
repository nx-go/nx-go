const normalizeOptions = {
  projectRoot: 'apps/api',
  parsedTags: ['api', 'backend'],
};

import type { Tree } from '@nx/devkit';
import * as nxDevkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { join } from 'path';
import * as shared from '../shared';
import applicationGenerator from './generator';
import type { ApplicationGeneratorSchema } from './schema';

jest.mock('@nx/devkit');
jest.mock('../shared', () => ({
  addNxPlugin: jest.fn(),
  createGoMod: jest.fn(),
  normalizeOptions: jest.fn().mockReturnValue(normalizeOptions),
}));

describe('application generator', () => {
  let tree: Tree;
  const options: ApplicationGeneratorSchema = { name: 'test' };

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  it('should write project configuration', async () => {
    await applicationGenerator(tree, options);
    expect(nxDevkit.addProjectConfiguration).toHaveBeenCalledWith(
      tree,
      'test',
      {
        root: 'apps/api',
        projectType: 'application',
        sourceRoot: 'apps/api',
        targets: expect.anything(),
        tags: ['api', 'backend'],
      }
    );
  });

  it('should generate files', async () => {
    await applicationGenerator(tree, options);
    expect(nxDevkit.generateFiles).toHaveBeenCalledWith(
      tree,
      join(__dirname, './files'),
      'apps/api',
      normalizeOptions
    );
  });

  it('should create go mod', async () => {
    await applicationGenerator(tree, options);
    expect(shared.createGoMod).toHaveBeenCalledWith(tree, normalizeOptions);
  });

  it('should not create go mod if skipped', async () => {
    await applicationGenerator(tree, { ...options, skipGoMod: true });
    expect(shared.createGoMod).not.toHaveBeenCalled();
  });

  it('should add nx plugin', async () => {
    await applicationGenerator(tree, options);
    expect(shared.addNxPlugin).toHaveBeenCalledWith(tree);
  });

  it('should format files', async () => {
    await applicationGenerator(tree, options);
    expect(nxDevkit.formatFiles).toHaveBeenCalledWith(tree);
  });

  it('should not format files if skipped', async () => {
    await applicationGenerator(tree, { ...options, skipFormat: true });
    expect(nxDevkit.formatFiles).not.toHaveBeenCalled();
  });
});
