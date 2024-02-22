import type { Tree } from '@nx/devkit';
import * as nxDevkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { GO_WORK_FILE } from '../../constants';
import * as shared from '../../utils';
import convertToOneModGenerator from './generator';
import type { ConvertToOneModGeneratorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  formatFiles: jest.fn(),
  logger: { error: jest.fn() },
}));
jest.mock('../../utils', () => ({
  createGoMod: jest.fn(),
  ensureGoConfigInSharedGlobals: jest.fn(),
  getProjectScope: jest.fn().mockReturnValue('proj'),
}));

describe('convert-to-one-mod generator', () => {
  let tree: Tree;
  const options: ConvertToOneModGeneratorSchema = {};

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write(GO_WORK_FILE, 'dummy content');
  });
  afterEach(() => jest.clearAllMocks());

  it('should delete Go workspace file', async () => {
    await convertToOneModGenerator(tree, options);
    expect(tree.exists(GO_WORK_FILE)).toBeFalsy();
  });

  it('should create go mod', async () => {
    await convertToOneModGenerator(tree, options);
    expect(shared.createGoMod).toHaveBeenCalledWith(tree, 'proj');
  });

  it('should ensure go config in shared globals', async () => {
    await convertToOneModGenerator(tree, options);
    expect(shared.ensureGoConfigInSharedGlobals).toHaveBeenCalledWith(tree);
  });

  it('should format files', async () => {
    await convertToOneModGenerator(tree, options);
    expect(nxDevkit.formatFiles).toHaveBeenCalled();
  });

  it('should not format files if skipped', async () => {
    await convertToOneModGenerator(tree, { ...options, skipFormat: true });
    expect(nxDevkit.formatFiles).not.toHaveBeenCalled();
  });

  it('should fail if there is no go workspace file', async () => {
    tree.delete(GO_WORK_FILE);
    await convertToOneModGenerator(tree, options);
    expect(nxDevkit.logger.error).toHaveBeenCalledWith(
      'Go workspace not found'
    );
    expect(shared.createGoMod).not.toHaveBeenCalled();
  });

  it('should fail if go workspace is already in use', async () => {
    tree.write(GO_WORK_FILE, 'go 1.21\n\nuse "./api"');
    await convertToOneModGenerator(tree, options);
    expect(nxDevkit.logger.error).toHaveBeenCalledWith(
      'Go workspace already in use and cannot be moved to one module'
    );
    expect(shared.createGoMod).not.toHaveBeenCalled();
  });
});
