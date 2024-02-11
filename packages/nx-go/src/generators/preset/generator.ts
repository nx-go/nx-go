import type { Tree } from '@nx/devkit';
import initGenerator from '../init/generator';
import type { PresetGeneratorSchema } from './schema';

export default async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  return initGenerator(tree, options);
}
