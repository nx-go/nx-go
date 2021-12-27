import { Tree } from '@nrwl/devkit'
import { NormalizedSchema } from './normalized-schema.interface'

export function createGoMod(tree: Tree, options: NormalizedSchema) {
  if (options.skipGoMod === false) {
    const modFile = 'go.mod'
    if (!tree.exists(`${modFile}`)) {
      tree.write(`${modFile}`, `module ${options.npmScope}\n`)
    }
  }
}
