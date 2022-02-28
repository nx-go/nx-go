import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing'
import { Tree, readProjectConfiguration, readWorkspaceConfiguration } from '@nrwl/devkit'

import generator from './generator'
import { ApplicationGeneratorSchema } from './schema'

describe('application generator', () => {
  let appTree: Tree
  const options: ApplicationGeneratorSchema = { name: 'test' }

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace()
  })

  it('should run successfully', async () => {
    await generator(appTree, options)
    const config = readProjectConfiguration(appTree, 'test')
    expect(config).toBeDefined()
  })

  it('should add go.mod to dependencies if present', async () => {
    await generator(appTree, options)
    const workspaceConfig = readWorkspaceConfiguration(appTree)
    expect(workspaceConfig.implicitDependencies).toBeDefined()
    expect(workspaceConfig.implicitDependencies['go.mod']).toBe('*')
  })

  it('should not add go.mod to dependencies if not present', async () => {
    await generator(appTree, { name: 'test', skipGoMod: true })
    const workspaceConfig = readWorkspaceConfiguration(appTree)
    if (workspaceConfig.implicitDependencies) {
      expect(workspaceConfig.implicitDependencies['go.mod']).toBeUndefined()
    }
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
