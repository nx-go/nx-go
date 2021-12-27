import { checkFilesExist, ensureNxProject, readFile, readJson, runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing'

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

    const resultLint = await runNxCommandAsync(`lint ${appName}`)
    expect(resultLint.stdout).toContain(`Executing command: go fmt ./...`)

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
