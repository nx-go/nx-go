import type { Tree } from '@nx/devkit';
import * as devkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as utils from '../../utils';
import update from './add-go-config-in-shared-globals';

jest.mock('../../utils');
jest.mock('@nx/devkit');

describe('add-go-config-in-shared-globals migration', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));

  it('should run successfully', async () => {
    const spyUpdateMethod = jest.spyOn(utils, 'ensureGoConfigInSharedGlobals');
    const spyFormatFiles = jest.spyOn(devkit, 'formatFiles');
    await update(tree);
    expect(spyUpdateMethod).toHaveBeenCalledWith(tree);
    expect(spyFormatFiles).toHaveBeenCalledWith(tree);
  });
});
