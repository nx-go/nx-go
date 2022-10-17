import { Tree } from '@nrwl/devkit'
import { canUseGoWork } from './can-use-go.work'
import { GO_WORK_FILE } from './constants'
import { getGoVersion } from './go-version'
import { NormalizedSchema } from './normalized-schema.interface'

const MODULES_REGEX = /use\s+\((?<modules>[^)]*)\)/g

function updateGoWorkUses(fileContent: string, newProject: string): string {
  const execResult = MODULES_REGEX.exec(fileContent)

  let modules: string[]
  if (execResult) {
    const groups = execResult.groups
    modules = [...new Set([...groups['modules'].split(/(\s+)/), newProject])].sort()
  } else {
    modules = [newProject]
  }

  const formattedModules = modules.reduce((ac, m) => {
    const moduleName = m.trim()
    return moduleName.length ? `${ac}\t${moduleName}\n` : ac
  }, '')
  return fileContent.replace(MODULES_REGEX, `use (\n${formattedModules})`)
}

export function updateGoWork(tree: Tree, options: NormalizedSchema) {
  if (options.useGoWork) {
    if (!tree.exists(GO_WORK_FILE)) {
      if (!options.skipVersionCheck && !canUseGoWork()) {
        throw new Error('Your version of go does not support workspaces')
      }

      const [major, minor] = options.skipVersionCheck ? ['1', '18'] : getGoVersion().split('.')

      tree.write(GO_WORK_FILE, `go ${major}.${minor}\n\nuse (\n    ${options.projectRoot}\n)\n`)
      return
    }

    const fileContent = tree.read(GO_WORK_FILE).toString()
    const newFileContent = updateGoWorkUses(fileContent, options.projectRoot)
    tree.write(GO_WORK_FILE, newFileContent)
  }
}
