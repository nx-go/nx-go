import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { join } from 'path';
import {
  addGoWorkDependency,
  createGoMod,
  detectModulePrefix,
  getNxGoPluginOptions,
  isGoWorkspace,
  normalizeOptions,
} from '../../utils';
import type { ApplicationGeneratorSchema } from './schema';

export default async function applicationGenerator(
  tree: Tree,
  schema: ApplicationGeneratorSchema
) {
  const options = await normalizeOptions(tree, schema, 'application');
  const projectConfiguration: ProjectConfiguration = {
    root: options.projectRoot,
    name: options.projectName,
    projectType: options.projectType,
    sourceRoot: options.projectRoot,
    tags: options.parsedTags,
    // Targets are now inferred by the plugin
  };

  addProjectConfiguration(tree, options.name, projectConfiguration);

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, options);

  if (isGoWorkspace(tree)) {
    const modulePrefix =
      getNxGoPluginOptions(tree)?.modulePrefix ??
      detectModulePrefix(tree, options.projectRoot);
    const moduleName = modulePrefix
      ? `${modulePrefix}/${options.projectRoot}`
      : options.projectRoot;

    createGoMod(tree, moduleName, options.projectRoot);
    addGoWorkDependency(tree, options.projectRoot);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
