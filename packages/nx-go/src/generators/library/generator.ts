import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  Tree,
} from '@nx/devkit';
import { addNxPlugin, createGoMod, normalizeOptions } from '../shared';
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

  const projectNames = names(options.projectName);
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    options.projectRoot,
    {
      ...options,
      ...projectNames,
      packageName: projectNames.fileName.split('-').join('_'),
    }
  );

  if (!schema.skipGoMod) {
    await createGoMod(tree, options);
    // TODO handle go workspace (go.work files)
  }

  addNxPlugin(tree);

  if (!schema.skipFormat) {
    await formatFiles(tree);
  }
}
