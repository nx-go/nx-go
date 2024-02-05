import type { Tree } from '@nx/devkit';
import * as devkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as utils from '../../utils';
import update from './add-nx-go-plugin';

jest.mock('../../utils');
jest.mock('@nx/devkit');

describe('add-nx-go-plugin migration', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));

  it('should run successfully', async () => {
    const spyAddNxPlugin = jest.spyOn(utils, 'addNxPlugin');
    const spyFormatFiles = jest.spyOn(devkit, 'formatFiles');
    await update(tree);
    expect(spyAddNxPlugin).toHaveBeenCalledWith(tree);
    expect(spyFormatFiles).toHaveBeenCalledWith(tree);
  });
});
