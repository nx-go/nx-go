import type { Tree } from '@nx/devkit';
import * as nxDevkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as shared from '../../utils';
import initGenerator from './generator';
import { InitGeneratorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  formatFiles: jest.fn(),
  logger: { warn: jest.fn() },
}));
jest.mock('../../utils', () => ({
  addNxPlugin: jest.fn(),
  createGoMod: jest.fn(),
  createGoWork: jest.fn(),
  ensureGoConfigInSharedGlobals: jest.fn(),
  getProjectScope: jest.fn().mockReturnValue('proj'),
  supportsGoWorkspace: jest.fn().mockReturnValue(true),
}));

describe('init generator', () => {
  let tree: Tree;
  const options: InitGeneratorSchema = {};

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  it('should add Nx plugin', async () => {
    await initGenerator(tree, options);
    expect(shared.addNxPlugin).toHaveBeenCalledWith(tree);
  });

  it('should create go workspace if supported', async () => {
    jest.spyOn(shared, 'supportsGoWorkspace').mockReturnValueOnce(true);
    await initGenerator(tree, options);
    expect(shared.createGoWork).toHaveBeenCalledWith(tree);
  });

  it('should create go mod if go workspace is not supported', async () => {
    jest.spyOn(shared, 'supportsGoWorkspace').mockReturnValueOnce(false);
    await initGenerator(tree, options);
    expect(shared.createGoMod).toHaveBeenCalledWith(tree, 'proj');
    expect(nxDevkit.logger.warn).toHaveBeenCalledTimes(1);
  });

  it('should ensure go configuration in shared globals', async () => {
    await initGenerator(tree, options);
    expect(shared.ensureGoConfigInSharedGlobals).toHaveBeenCalledWith(tree);
  });

  it('should format files', async () => {
    await initGenerator(tree, options);
    expect(nxDevkit.formatFiles).toHaveBeenCalledWith(tree);
  });

  it('should not format files if skipped', async () => {
    await initGenerator(tree, { ...options, skipFormat: true });
    expect(nxDevkit.formatFiles).not.toHaveBeenCalled();
  });
});
