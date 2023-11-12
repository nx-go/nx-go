import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { Tree, readProjectConfiguration, readNxJson } from '@nx/devkit'

import generator from './generator'
import { ApplicationGeneratorSchema } from './schema'
import { GO_MOD_FILE } from '../../utils/constants'

describe('application generator', () => {
  let appTree: Tree
  const options: ApplicationGeneratorSchema = { name: 'test' }

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({
      layout: 'apps-libs',
    })
  })

  it('should run successfully', async () => {
    await generator(appTree, options)
    const config = readProjectConfiguration(appTree, 'test')
    expect(config).toBeDefined()
  })

  it('should add go.mod to sharedGlobals if present', async () => {
    await generator(appTree, options)
    const workspaceConfig = readNxJson(appTree)
    expect(workspaceConfig.namedInputs).toBeDefined()
    expect(workspaceConfig.namedInputs['sharedGlobals']).toEqual(
      expect.arrayContaining([`{workspaceRoot}/${GO_MOD_FILE}`]),
    )
  })

  it('should not add go.mod to sharedGlobals if not present', async () => {
    await generator(appTree, { name: 'test', skipGoMod: true })
    const workspaceConfig = readNxJson(appTree)

    expect(workspaceConfig.namedInputs?.['sharedGlobals']).not.toEqual(
      expect.arrayContaining([`{workspaceRoot}/${GO_MOD_FILE}`]),
    )
  })

  it('should use posix-style paths', async () => {
    await generator(appTree, options)
    const { targets } = readProjectConfiguration(appTree, 'test')
    expect(targets).toBeDefined()
    expect(targets.build?.options?.outputPath).toBe('dist/apps/test')
    expect(targets.build?.options?.main).toBe('apps/test/main.go')
    expect(targets.serve?.options?.main).toBe('apps/test/main.go')
  })
})
