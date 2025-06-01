import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  ProjectConfiguration,
  TargetConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { join } from 'path';
import {
  addGoWorkDependency,
  createGoMod,
  isGoWorkspace,
  normalizeOptions,
} from '../../utils';
import { LibraryGeneratorSchema } from './schema';

export const defaultTargets: { [targetName: string]: TargetConfiguration } = {
  test: {
    executor: '@nx-go/nx-go:test',
  },
  lint: {
    executor: '@nx-go/nx-go:lint',
  },
};

export default async function libraryGenerator(
  tree: Tree,
  schema: LibraryGeneratorSchema
) {
  const options = await normalizeOptions(
    tree,
    schema,
    'library',
    '@nx-go/nx-go:library'
  );
  const projectConfiguration: ProjectConfiguration = {
    root: options.projectRoot,
    name: options.projectName,
    projectType: options.projectType,
    sourceRoot: options.projectRoot,
    tags: options.parsedTags,
    targets: defaultTargets,
  };

  addProjectConfiguration(tree, options.name, projectConfiguration);

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, {
    ...options,
    ...names(options.projectName),
  });

  if (isGoWorkspace(tree)) {
    createGoMod(tree, options.projectRoot, options.projectRoot);
    addGoWorkDependency(tree, options.projectRoot);
    projectConfiguration.targets.tidy = {
      executor: '@nx-go/nx-go:tidy',
    };
    updateProjectConfiguration(tree, options.name, projectConfiguration);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
