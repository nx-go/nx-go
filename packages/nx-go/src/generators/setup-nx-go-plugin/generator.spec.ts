import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { Tree, readNxJson, updateNxJson } from '@nx/devkit'

import generator from './generator'

describe('setup-nx-go-plugin generator', () => {
  let appTree: Tree

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace()
  })

  it('should run successfully', async () => {
    await generator(appTree)
    const config = readNxJson(appTree)
    expect(config.plugins).toBeDefined()
    expect(config.plugins.length).toBe(1)
    expect(config.plugins[0]).toBe('@nx-go/nx-go')
  })

  it('should merge correctly', async () => {
    let config = readNxJson(appTree)
    config.plugins = ['fake-plugin']
    updateNxJson(appTree, config)

    await generator(appTree)
    config = readNxJson(appTree)
    expect(config.plugins).toBeDefined()
    expect(config.plugins.length).toBe(2)
    expect(config.plugins[1]).toBe('@nx-go/nx-go')
  })

  it('should do nothing when already defined', async () => {
    let config = readNxJson(appTree)
    config.plugins = ['@nx-go/nx-go']
    updateNxJson(appTree, config)

    await generator(appTree)
    config = readNxJson(appTree)
    expect(config.plugins).toBeDefined()
    expect(config.plugins.length).toBe(1)
    expect(config.plugins[0]).toBe('@nx-go/nx-go')
  })
})
