import { checkFilesExist, ensureNxProject, readJson, runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing'
describe('application e2e', () => {
  it('should create application', async (done) => {
    const appName = uniq('app')
    ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go')
    await runNxCommandAsync(`generate @nx-go/nx-go:application ${appName}`)

    const resultBuild = await runNxCommandAsync(`build ${appName}`)
    expect(resultBuild.stdout).toContain(`Executing command: go build`)

    const resultLint = await runNxCommandAsync(`lint ${appName}`)
    expect(resultLint.stdout).toContain(`Executing command: go fmt apps/${appName}/**/*.go`)
    expect(resultLint.stdout).toContain(`apps/`)

    const resultServe = await runNxCommandAsync(`serve ${appName}`)
    expect(resultServe.stdout).toContain(`Executing command: go run`)

    const resultTest = await runNxCommandAsync(`test ${appName}`)
    expect(resultTest.stdout).toContain(`Executing command: go test -v apps/${appName}/**/*.go`)

    done()
  })

  describe('--directory', () => {
    it('should create main.go in the specified directory', async (done) => {
      const plugin = uniq('nx-go')
      ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go')
      await runNxCommandAsync(`generate @nx-go/nx-go:application ${plugin} --directory subdir`)
      expect(() => checkFilesExist(`apps/subdir/${plugin}/main.go`)).not.toThrow()
      done()
    })
  })

  describe('--tags', () => {
    it('should add tags to nx.json', async (done) => {
      const plugin = uniq('nx-go')
      ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go')
      await runNxCommandAsync(`generate @nx-go/nx-go:application ${plugin} --tags e2etag,e2ePackage`)
      const nxJson = readJson('nx.json')
      expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage'])
      done()
    })
  })
})
