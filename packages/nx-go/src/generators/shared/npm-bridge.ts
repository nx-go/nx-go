import type { Tree } from '@nx/devkit';
import { readJson } from '@nx/devkit';

export const getProjectScope = (tree: Tree): string => {
  const { name: packageName } = readJson(tree, 'package.json');
  return packageName.split('/')[0].replace('@', '');
};
