import { addProjectConfiguration, formatFiles, getWorkspaceLayout, Tree } from '@nrwl/devkit'
import { join, normalize } from 'path'
import { addFiles, createGoMod, normalizeOptions, toPosixPath } from '../../utils'
import { ApplicationGeneratorSchema } from './schema'

export default async function (tree: Tree, options: ApplicationGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, getWorkspaceLayout(tree).appsDir, options)
  const sourceRoot = normalizedOptions.projectRoot

  const targetOptions = {
    outputPath: toPosixPath(join(normalize('dist'), sourceRoot)),
    main: toPosixPath(join(sourceRoot, 'main.go')),
  }

  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: sourceRoot,
    projectType: 'application',
    sourceRoot,
    targets: {
      build: {
        executor: '@nx-go/nx-go:build',
        options: targetOptions,
      },
      serve: {
        executor: '@nx-go/nx-go:serve',
        options: {
          main: toPosixPath(join(sourceRoot, 'main.go')),
        },
      },
      test: {
        executor: '@nx-go/nx-go:test',
      },
      lint: {
        executor: '@nx-go/nx-go:lint',
      },
    },
    tags: normalizedOptions.parsedTags,
  })
  addFiles(tree, join(__dirname, 'files'), normalizedOptions)
  createGoMod(tree, normalizedOptions)
  await formatFiles(tree)
}
