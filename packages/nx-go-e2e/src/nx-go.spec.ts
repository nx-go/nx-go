import {
  checkFilesExist,
  readFile,
  readJson,
  runNxCommandAsync,
  uniq,
  updateFile,
} from '@nx/plugin/testing';
import { execSync } from 'child_process';
import { rmSync } from 'fs';
import { join } from 'path';
import createTestProject from '../shared/create-test-project';
import { addNxTarget } from '../shared/update-nx-config';

describe('nx-go', () => {
  const appName = uniq('app');
  const libName = uniq('lib');

  let projectDirectory: string;

  beforeAll(() => {
    projectDirectory = createTestProject();

    // The plugin has been built and published to a local registry in the jest globalSetup
    // Install the plugin built with the latest source code into the test repo
    execSync(`npm install -D @nx-go/nx-go@latest`, {
      cwd: projectDirectory,
      stdio: 'inherit',
      env: process.env,
    });
  });

  afterAll(() => {
    rmSync(projectDirectory, { recursive: true, force: true });
  });

  it('should be installed', () => {
    // npm ls will fail if the package is not installed properly
    execSync('npm ls @nx-go/nx-go', {
      cwd: projectDirectory,
      stdio: 'inherit',
    });
  });

  it('should initialize the workspace', async () => {
    await runNxCommandAsync(`generate @nx-go/nx-go:init`);
    expect(() => checkFilesExist(`go.work`)).not.toThrow();
  });

  it('should create an application', async () => {
    await runNxCommandAsync(`generate @nx-go/nx-go:application ${appName}`);

    expect(() => checkFilesExist(`${appName}/main.go`)).not.toThrow();
    expect(() => checkFilesExist(`${appName}/go.mod`)).not.toThrow();
    expect(readFile(`${appName}/go.mod`)).toContain(`module ${appName}`);
    expect(readFile(`go.work`)).toContain(`use ./${appName}`);

    const { name, projectType } = readJson(`${appName}/project.json`);
    expect(name).toEqual(appName);
    expect(projectType).toEqual('application');
  });

  it('should create a library', async () => {
    await runNxCommandAsync(`generate @nx-go/nx-go:library ${libName}`);

    expect(() => checkFilesExist(`${libName}/${libName}.go`)).not.toThrow();
    expect(() => checkFilesExist(`${libName}/go.mod`)).not.toThrow();
    expect(readFile(`${libName}/go.mod`)).toContain(`module ${libName}`);
    expect(readFile(`go.work`)).toContain(
      `use (\n\t./${appName}\n\t./${libName}\n)`
    );

    const { name, projectType } = readJson(`${libName}/project.json`);
    expect(name).toEqual(libName);
    expect(projectType).toEqual('library');
  });

  it('should create an application in a sub directory', async () => {
    const name = uniq('app');
    // directory is not derived since Nx 20
    const directory = process.env.NX_VERSION.startsWith('20')
      ? `apps/${name}`
      : 'apps';
    await runNxCommandAsync(
      `generate @nx-go/nx-go:application ${name} --directory=${directory}`
    );
    expect(() => checkFilesExist(`apps/${name}/main.go`)).not.toThrow();
    expect(() => checkFilesExist(`apps/${name}/go.mod`)).not.toThrow();
  });

  it('should build the application', async () => {
    const result = await runNxCommandAsync(`build ${appName}`);
    const ext = process.platform === 'win32' ? '.exe' : '';
    expect(result.stdout).toContain(
      `Executing command: go build -o dist/${appName}${ext} ${appName}/main.go`
    );
  });

  describe('Linting', () => {
    it('should execute the default linter', async () => {
      const result = await runNxCommandAsync(`lint ${appName}`);
      expect(result.stdout).toContain(`Executing command: go fmt ./...`);
    });

    it('should use a custom linter', async () => {
      const result = await runNxCommandAsync(
        `lint ${appName} --linter="go vet"`
      );
      expect(result.stdout).toContain(`Executing command: go vet ./...`);
    });
  });

  describe('Tidy', () => {
    it('should execute go mod tidy', async () => {
      const result = await runNxCommandAsync(`tidy ${appName}`);
      expect(result.stdout).toContain(`Executing command: go mod tidy`);
    });
  });

  describe('Generate', () => {
    beforeAll(() =>
      addNxTarget(appName, 'generate', { executor: '@nx-go/nx-go:generate' })
    );

    it('should execute go generate', async () => {
      const result = await runNxCommandAsync(`run ${appName}:generate`);
      expect(result.stdout).toContain(`Executing command: go generate`);
    });
  });

  it('should serve the application', async () => {
    const result = await runNxCommandAsync(`serve ${appName}`);
    expect(result.stdout).toContain(`Executing command: go run main.go`);
  });

  it('should test the application', async () => {
    const result = await runNxCommandAsync(`test ${appName} --cover --verbose`);
    expect(result.stdout).toContain(
      `Executing command: go test -v -cover ./...`
    );
  });

  describe('Project graph', () => {
    it('should create graph with dependencies', async () => {
      const captilizedLibName = libName[0].toUpperCase() + libName.substring(1);
      updateFile(
        join(appName, 'main.go'),
        `package main

        import (
          "fmt"
          "${libName}"
        )

        func main() {
          fmt.Println(${libName}.${captilizedLibName}("${appName}"))
        }`
      );

      await runNxCommandAsync('dep-graph --file=graph.json');
      const { graph } = readJson('graph.json');

      expect(graph).toBeDefined();
      expect(graph.dependencies).toBeDefined();
      expect(graph.dependencies[appName]).toBeDefined();

      const appDependencies = graph.dependencies[appName];
      expect(appDependencies.length).toBe(1);
      expect(appDependencies[0].target).toBe(libName);
    });

    it('should work with packages with import in the name', async () => {
      const dataimportLib = 'dataimport';
      await runNxCommandAsync(`generate @nx-go/nx-go:library ${dataimportLib}`);

      expect(() =>
        checkFilesExist(`${dataimportLib}/${dataimportLib}.go`)
      ).not.toThrow();

      const captilizedDataImportName =
        dataimportLib[0].toUpperCase() + dataimportLib.substring(1);
      const captilizedLibName = libName[0].toUpperCase() + libName.substring(1);
      updateFile(
        join(dataimportLib, dataimportLib + '.go'),
        `package ${dataimportLib}

        import (
          "${libName}"
        )

        func ${captilizedDataImportName}() string {
          return ${libName}.${captilizedLibName}("${appName}")
        }`
      );

      updateFile(
        join(appName, 'main.go'),
        `package main

        import (
          "fmt"
          "${dataimportLib}"
        )

        func main() {
          fmt.Println(${dataimportLib}.${captilizedDataImportName}("${appName}"))
        }`
      );

      await runNxCommandAsync('dep-graph --file=graph.json');
      const { graph } = readJson('graph.json');

      expect(graph).toBeDefined();
      expect(graph.dependencies).toBeDefined();
      expect(graph.dependencies[dataimportLib]).toBeDefined();

      const dataimportDependencies = graph.dependencies[dataimportLib];
      expect(dataimportDependencies.length).toBe(1);
      expect(dataimportDependencies[0].target).toBe(libName);
    });
  });
});
