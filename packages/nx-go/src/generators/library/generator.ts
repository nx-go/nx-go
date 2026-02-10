import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { join } from 'path';
import {
  addGoWorkDependency,
  createGoMod,
  isGoWorkspace,
  normalizeOptions,
} from '../../utils';
import { LibraryGeneratorSchema } from './schema';

export default async function libraryGenerator(
  tree: Tree,
  schema: LibraryGeneratorSchema
) {
  const options = await normalizeOptions(tree, schema, 'library');
  const projectConfiguration: ProjectConfiguration = {
    root: options.projectRoot,
    name: options.projectName,
    projectType: options.projectType,
    sourceRoot: options.projectRoot,
    tags: options.parsedTags,
    // Targets are now inferred by the plugin
  };

  addProjectConfiguration(tree, options.name, projectConfiguration);

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, {
    ...options,
    ...names(options.projectName),
  });

  if (isGoWorkspace(tree)) {
    createGoMod(tree, options.projectRoot, options.projectRoot);
    addGoWorkDependency(tree, options.projectRoot);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
