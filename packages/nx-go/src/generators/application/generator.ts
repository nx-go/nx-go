import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
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
import type { ApplicationGeneratorSchema } from './schema';

export const defaultTargets: { [targetName: string]: TargetConfiguration } = {
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
};

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
  const projectConfiguration: ProjectConfiguration = {
    root: options.projectRoot,
    name: options.projectName,
    projectType: options.projectType,
    sourceRoot: options.projectRoot,
    tags: options.parsedTags,
    targets: defaultTargets,
  };

  addProjectConfiguration(tree, options.name, projectConfiguration);

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, options);

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
