import { formatFiles, logger, Tree } from '@nx/devkit';
import { GO_WORK_FILE } from '../../constants';
import { createGoMod, getProjectScope } from '../../utils';
import { ConvertToOneModGeneratorSchema } from './schema';

export default async function convertToOneModGenerator(
  tree: Tree,
  options: ConvertToOneModGeneratorSchema
) {
  if (!tree.exists(GO_WORK_FILE)) {
    logger.error('Go workspace not found');
    return;
  }
  const workContent = tree.read(GO_WORK_FILE).toString();
  if (/^use /m.test(workContent)) {
    logger.error(
      'Go workspace already in use and cannot be moved to one module'
    );
    return;
  }

  tree.delete(GO_WORK_FILE);
  createGoMod(tree, getProjectScope(tree));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
