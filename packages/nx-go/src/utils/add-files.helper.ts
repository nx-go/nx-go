import { generateFiles, names, offsetFromRoot, Tree } from '@nrwl/devkit'
import { NormalizedSchema } from './normalized-schema.interface'

export function addFiles(tree: Tree, srcFolder: string, options: NormalizedSchema) {
  const projectNames = names(options.name)
  const templateOptions = {
    ...options,
    ...projectNames,
    packageName: names(options.projectName).fileName.split('-').join('_'),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  }
  generateFiles(tree, srcFolder, options.projectRoot, templateOptions)
}
