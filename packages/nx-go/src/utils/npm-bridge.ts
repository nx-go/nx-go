import type { Tree } from '@nx/devkit';
import { readJson } from '@nx/devkit';

/**
 * Retrieves the scope of npm project in the package.json file.
 *
 * @param tree the project tree
 */
export const getProjectScope = (tree: Tree): string => {
  const { name: packageName } = readJson(tree, 'package.json');
  return packageName.split('/')[0].replace('@', '');
};
