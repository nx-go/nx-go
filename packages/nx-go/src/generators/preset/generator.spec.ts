import type { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initGenerator from '../init/generator';
import presetGenerator from './generator';
import type { PresetGeneratorSchema } from './schema';

jest.mock('../init/generator');

describe('preset generator', () => {
  let tree: Tree;
  const options: PresetGeneratorSchema = {};

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  it('should run init generator', async () => {
    await presetGenerator(tree, options);
    expect(initGenerator).toHaveBeenCalledWith(tree, options);
  });
});
