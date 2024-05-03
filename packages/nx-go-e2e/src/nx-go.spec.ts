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
    expect(readFile(`${appName}/go.mod`)).toContain(`module proj/${appName}`);
    expect(readFile(`go.work`)).toContain(`use ./${appName}`);
  });

  it('should create a library', async () => {
    await runNxCommandAsync(`generate @nx-go/nx-go:library ${libName}`);

    expect(() => checkFilesExist(`${libName}/${libName}.go`)).not.toThrow();
    expect(() => checkFilesExist(`${libName}/go.mod`)).not.toThrow();
    expect(readFile(`${libName}/go.mod`)).toContain(`module proj/${libName}`);
    expect(readFile(`go.work`)).toContain(
      `use (\n\t./${appName}\n\t./${libName}\n)`
    );
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
          "proj/${libName}"
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
  });
});
