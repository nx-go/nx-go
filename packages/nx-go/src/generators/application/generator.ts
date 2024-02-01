import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
} from '@nx/devkit';
import { join } from 'path';
import { addNxPlugin, createGoMod, normalizeOptions } from '../shared';
import type { ApplicationGeneratorSchema } from './schema';

export default async function applicationGenerator(
  tree: Tree,
  schema: ApplicationGeneratorSchema
) {
  const options = await normalizeOptions(
    tree,
    schema,
    'application',
    '@nx-go/nx-go:application'
  );

  addProjectConfiguration(tree, schema.name, {
    root: options.projectRoot,
    projectType: 'application',
    sourceRoot: options.projectRoot,
    tags: options.parsedTags,
    targets: {
      build: {
        executor: '@nx-go/nx-go:build',
        options: {
          main: '{projectRoot}/main.go',
        },
      },
      serve: {
        executor: '@nx-go/nx-go:serve',
        options: {
          main: '{projectRoot}/main.go',
        },
      },
      test: {
        executor: '@nx-go/nx-go:test',
      },
      lint: {
        executor: '@nx-go/nx-go:lint',
      },
    },
  });

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, options);

  if (!schema.skipGoMod) {
    await createGoMod(tree, options);
    // TODO handle go workspace (go.work files)
  }

  addNxPlugin(tree);

  if (!schema.skipFormat) {
    await formatFiles(tree);
  }
}
