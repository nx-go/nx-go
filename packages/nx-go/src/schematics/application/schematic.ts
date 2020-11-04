import { apply, applyTemplates, chain, mergeWith, move, Rule, url } from '@angular-devkit/schematics'
import {
  addProjectToNxJsonInTree,
  names,
  offsetFromRoot,
  projectRootDir,
  ProjectType,
  toFileName,
  updateWorkspace,
} from '@nrwl/workspace'
import { ApplicationSchematicSchema } from './schema'
import { join, normalize } from 'path'

/**
 * Depending on your needs, you can change this to either `Library` or `Application`
 */
const projectType = ProjectType.Application

interface NormalizedSchema extends ApplicationSchematicSchema {
  projectName: string
  projectRoot: string
  projectDirectory: string
  parsedTags: string[]
}

function normalizeOptions(options: ApplicationSchematicSchema): NormalizedSchema {
  const name = toFileName(options.name)
  const projectDirectory = options.directory ? `${toFileName(options.directory)}/${name}` : name
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-')
  const projectRoot = `${projectRootDir(projectType)}/${projectDirectory}`
  const parsedTags = options.tags ? options.tags.split(',').map((s) => s.trim()) : []

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  }
}

function addFiles(options: NormalizedSchema): Rule {
  return mergeWith(
    apply(url(`./files`), [
      applyTemplates({
        ...options,
        ...names(options.name),
        offsetFromRoot: offsetFromRoot(options.projectRoot),
      }),
      move(options.projectRoot),
    ]),
  )
}

export default function (options: ApplicationSchematicSchema): Rule {
  const normalizedOptions = normalizeOptions(options)
  return chain([
    updateWorkspace((workspace) => {
      const appProjectRoot = normalizedOptions.projectRoot
      const sourceRoot = appProjectRoot
      const project = workspace.projects.add({
        name: normalizedOptions.projectName,
        root: normalizedOptions.projectRoot,
        sourceRoot,
        projectType,
      })
      const options = {
        outputPath: join(normalize('dist'), appProjectRoot),
        main: join(project.sourceRoot, 'main.go'),
      }
      project.targets.add({
        name: 'build',
        builder: '@nx-go/nx-go:build',
        options,
      })
      project.targets.add({
        name: 'serve',
        builder: '@nx-go/nx-go:serve',
        options: {
          main: join(project.sourceRoot, 'main.go'),
        },
      })
      project.targets.add({
        name: 'test',
        builder: '@nx-go/nx-go:test',
        options: {
          main: join(project.sourceRoot, 'main_test.go'),
        },
      })
      project.targets.add({
        name: 'lint',
        builder: '@nx-go/nx-go:lint',
      })
    }),
    addProjectToNxJsonInTree(normalizedOptions.projectName, {
      tags: normalizedOptions.parsedTags,
    }),
    addFiles(normalizedOptions),
  ])
}
