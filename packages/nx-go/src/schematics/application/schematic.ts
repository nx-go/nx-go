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
import { readJSONSync } from 'fs-extra'
import { join, normalize } from 'path'
import { ApplicationSchematicSchema } from './schema'

/**
 * Depending on your needs, you can change this to either `Library` or `Application`
 */
const projectType = ProjectType.Application

interface NormalizedSchema extends ApplicationSchematicSchema {
  npmScope: string
  projectName: string
  projectRoot: string
  projectDirectory: string
  parsedTags: string[]
  skipGoMod: boolean
}

function normalizeOptions(options: ApplicationSchematicSchema): NormalizedSchema {
  const name = toFileName(options.name)
  const nxJson = readJSONSync(join(process.cwd(), 'nx.json')) || {}
  const projectDirectory = options.directory ? `${toFileName(options.directory)}/${name}` : name
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-')
  const projectRoot = `${projectRootDir(projectType)}/${projectDirectory}`
  const parsedTags = options.tags ? options.tags.split(',').map((s) => s.trim()) : []

  return {
    ...options,
    npmScope: nxJson.npmScope,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    skipGoMod: options.skipGoMod || false,
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

function createGoMod(options: NormalizedSchema): Rule {
  return (tree, context) => {
    if (options.skipGoMod === false) {
      const modFile = 'go.mod'
      if (!tree.exists(`${modFile}`)) {
        context.logger.info(`Creating ${modFile} in workspace root`)
        tree.create(`${modFile}`, `module ${options.npmScope}\n`)
      }
    }
  }
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
    createGoMod(normalizedOptions),
  ])
}
