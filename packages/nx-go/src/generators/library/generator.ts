import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
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
  const options = await normalizeOptions(
    tree,
    schema,
    'library',
    '@nx-go/nx-go:library'
  );

  addProjectConfiguration(tree, options.name, {
    root: options.projectRoot,
    projectType: options.projectType,
    sourceRoot: options.projectRoot,
    tags: options.parsedTags,
    targets: {
      test: {
        executor: '@nx-go/nx-go:test',
      },
      lint: {
        executor: '@nx-go/nx-go:lint',
      },
    },
  });

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, {
    ...options,
    ...names(options.projectName),
  });

  if (isGoWorkspace(tree)) {
    createGoMod(
      tree,
      `${options.npmScope}/${options.moduleName}`,
      options.projectRoot
    );
    addGoWorkDependency(tree, options.projectRoot);
  }

  if (!schema.skipFormat) {
    await formatFiles(tree);
  }
}
