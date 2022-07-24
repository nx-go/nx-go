import {
  checkFilesExist,
  ensureNxProject,
  readFile,
  readJson,
  runNxCommandAsync,
  tmpProjPath,
  uniq,
  updateFile,
} from '@nrwl/nx-plugin/testing'
import { unlinkSync } from 'fs'
import { join } from 'path'
import { replaceFolder } from '../utils/folder'

describe('application e2e', () => {
  it('should create application', async () => {
    const appName = uniq('app')
    const libName = uniq('lib')
    ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go')
    await runNxCommandAsync(`generate @nx-go/nx-go:application ${appName}`)

    expect(() => checkFilesExist(`apps/${appName}/main.go`)).not.toThrow()
    expect(() => checkFilesExist(`go.mod`)).not.toThrow()
    expect(readFile(`go.mod`)).toContain('module proj')

    const resultBuild = await runNxCommandAsync(`build ${appName}`)
    expect(resultBuild.stdout).toContain(`Executing command: go build`)

    const resultServe = await runNxCommandAsync(`serve ${appName}`)
    expect(resultServe.stdout).toContain(`Executing command: go run main.go`)

    const resultTest = await runNxCommandAsync(`test ${appName}`)
    expect(resultTest.stdout).toContain(`Executing command: go test -v ./... -cover -race`)

    const resultTestSkip = await runNxCommandAsync(`test ${appName} --skip-cover --skip-race`)
    expect(resultTestSkip.stdout).toContain(`Executing command: go test -v ./...`)
    expect(resultTestSkip.stdout).not.toContain(` -cover -race `)

    await runNxCommandAsync(`generate @nx-go/nx-go:library ${libName} --directory=${appName}`)
    expect(() => checkFilesExist(`libs/${appName}/${libName}/${appName}-${libName}.go`)).not.toThrow()
    expect(readFile(`libs/${appName}/${libName}/${appName}-${libName}.go`)).toContain(`package ${appName}_${libName}`)
  })

  describe('--useGoWork', () => {
    it('Should create a go.work file', async () => {
      const plugin = uniq('nx-go')
      ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go')
      await runNxCommandAsync(`generate @nx-go/nx-go:application ${plugin} --useGoWork --skipVersionCheck`)
      expect(() => checkFilesExist(`go.work`)).not.toThrow()
    })
  })

  describe('--directory', () => {
    it('should create main.go in the specified directory', async () => {
      const plugin = uniq('nx-go')
      ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go')
      await runNxCommandAsync(`generate @nx-go/nx-go:application ${plugin} --directory subdir`)
      expect(() => checkFilesExist(`apps/subdir/${plugin}/main.go`)).not.toThrow()
    })
  })

  describe('--tags', () => {
    it('should add tags to nx.json', async () => {
      const plugin = uniq('nx-go')
      ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go')
      await runNxCommandAsync(`generate @nx-go/nx-go:application ${plugin} --tags e2etag,e2ePackage`)
      const projectJson = readJson(`apps/${plugin}/project.json`)
      expect(projectJson.tags).toEqual(['e2etag', 'e2ePackage'])
    })
  })
})

describe('go-package-graph', () => {
  it('should work with affected commands', async () => {
    const appName = uniq('app')
    const libName = uniq('lib')
    ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go')
    // Need to copy the plugin as linking it throws:
    // 'Couldn't find a package.json for Nx plugin:@nx-go/nx-go'
    unlinkSync(tmpProjPath('node_modules/@nx-go/nx-go'))
    replaceFolder(join(__dirname, '../../../dist/packages/nx-go'), tmpProjPath('node_modules/@nx-go/nx-go'))

    await runNxCommandAsync(`generate @nx-go/nx-go:application ${appName}`)
    await runNxCommandAsync(`generate @nx-go/nx-go:library ${libName}`)
    await runNxCommandAsync(`generate @nx-go/nx-go:setup-nx-go-plugin`)

    const captilizedLibName = libName[0].toUpperCase() + libName.substring(1)

    updateFile(
      join('apps', appName, 'main.go'),
      `package main

      import (
        "fmt"

        "proj/libs/${libName}"
      )

      func main() {
        fmt.Println(${libName}.${captilizedLibName}("${appName}"))
      }`,
    )

    await runNxCommandAsync('dep-graph --file=output.json')

    const { graph } = readJson('output.json')
    expect(graph).toBeDefined()
    expect(graph.dependencies).toBeDefined()
    expect(graph.dependencies[appName]).toBeDefined()

    const appDependencies = graph.dependencies[appName]
    expect(appDependencies.length).toBe(1)
    expect(appDependencies[0].target).toBe(libName)
  })
})

describe('lint target', () => {
  let appName: string = ''
  beforeEach(async () => {
    appName = uniq('app')
    ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go')
    await runNxCommandAsync(`generate @nx-go/nx-go:application ${appName}`)
  })
  it('should use go fmt by default', async () => {
    const testFile = `package main
    import "fmt"
    func main() {fmt.Println("test");}`
    updateFile(`apps/${appName}/main.go`, testFile)

    await runNxCommandAsync(`lint ${appName}`)

    const formatted = readFile(`apps/${appName}/main.go`)

    expect(formatted).not.toBe(testFile)
  })

  it('should work with go vet', async () => {
    const projectConfig = JSON.parse(readFile(`apps/${appName}/project.json`))
    const linterConfig = projectConfig.targets?.lint
    expect(linterConfig).toBeDefined()
    linterConfig.options = {
      linter: 'go vet',
    }

    updateFile(`apps/${appName}/project.json`, JSON.stringify(projectConfig))
    await runNxCommandAsync(`lint ${appName}`)
  })

  it('should fail with an invalid linter', async () => {
    const projectConfig = JSON.parse(readFile(`apps/${appName}/project.json`))
    const linterConfig = projectConfig.targets?.lint
    expect(linterConfig).toBeDefined()
    linterConfig.options = {
      linter: 'go wrong',
    }

    updateFile(`apps/${appName}/project.json`, JSON.stringify(projectConfig))
    await expect(runNxCommandAsync(`lint ${appName}`)).rejects.toThrow()
  })
})
