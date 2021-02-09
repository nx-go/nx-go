import { apply, applyTemplates, chain, mergeWith, move, Rule, url } from '@angular-devkit/schematics'
import { strings } from '@angular-devkit/core'
import {
  addProjectToNxJsonInTree,
  names,
  offsetFromRoot,
  projectRootDir,
  ProjectType,
  toFileName,
  updateWorkspace,
} from '@nrwl/workspace'
import { LibrarySchematicSchema } from './schema'

/**
 * Depending on your needs, you can change this to either `Library` or `Library`
 */
const projectType = ProjectType.Library

interface NormalizedSchema extends LibrarySchematicSchema {
  projectName: string
  projectRoot: string
  projectDirectory: string
  parsedTags: string[]
}

function normalizeOptions(options: LibrarySchematicSchema): NormalizedSchema {
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
        ...strings,
        ...options,
        ...names(options.name),
        offsetFromRoot: offsetFromRoot(options.projectRoot),
      }),
      move(options.projectRoot),
    ]),
  )
}

export default function (options: LibrarySchematicSchema): Rule {
  const normalizedOptions = normalizeOptions(options)
  return chain([
    updateWorkspace((workspace) => {
      const sourceRoot = normalizedOptions.projectRoot
      const project = workspace.projects.add({
        name: normalizedOptions.projectName,
        root: normalizedOptions.projectRoot,
        sourceRoot,
        projectType,
      })

      project.targets.add({
        name: 'test',
        builder: '@nx-go/nx-go:test',
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
