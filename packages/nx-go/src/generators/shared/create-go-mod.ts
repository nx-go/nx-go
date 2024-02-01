import type { Tree } from '@nx/devkit';
import { GO_MOD_FILE } from '../../constants';
import { GeneratorNormalizedSchema } from './normalize-options';
import { addGoModToSharedGlobals } from './update-nx-json';

export const createGoMod = async (
  tree: Tree,
  schema: GeneratorNormalizedSchema
) => {
  if (!tree.exists(GO_MOD_FILE)) {
    tree.write(GO_MOD_FILE, `module ${schema.npmScope}\n`);
  }
  addGoModToSharedGlobals(tree);
};
