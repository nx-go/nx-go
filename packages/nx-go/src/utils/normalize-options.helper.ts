import { names, readJson, Tree } from '@nrwl/devkit'
import { ApplicationGeneratorSchema } from '../generators/application/schema'
import { NormalizedSchema } from './normalized-schema.interface'
import { shouldUseGoWork } from './should-use-go.work'

export function normalizeOptions(
  tree: Tree,
  projectBase: string,
  options: ApplicationGeneratorSchema,
): NormalizedSchema {
  const nxJson = readJson(tree, 'nx.json')
  const name = names(options.name).fileName
  const projectDirectory = options.directory ? `${names(options.directory).fileName}/${name}` : name
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-')
  const projectRoot = `${projectBase}/${projectDirectory}`
  const parsedTags = options.tags ? options.tags.split(',').map((s) => s.trim()) : []

  const useGoWork = options.skipVersionCheck ? !!options.useGoWork : shouldUseGoWork(tree, !!options.useGoWork)

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    skipGoMod: !!options.skipGoMod,
    npmScope: nxJson.npmScope,
    useGoWork,
    skipVersionCheck: !!options.skipVersionCheck,
  }
}
