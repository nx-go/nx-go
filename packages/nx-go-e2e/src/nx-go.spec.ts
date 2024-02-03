import {
  checkFilesExist,
  readFile,
  runCommandAsync,
  uniq,
} from '@nx/plugin/testing';
import { execSync } from 'child_process';
import { rmSync } from 'fs';
import createTestProject from '../shared/create-test-project';

describe('nx-go', () => {
  const appName = uniq('app');
  const libName = uniq('lib');

  let projectDirectory: string;

  beforeAll(() => {
    projectDirectory = createTestProject();

    // The plugin has been built and published to a local registry in the jest globalSetup
    // Install the plugin built with the latest source code into the test repo
    execSync(`pnpm install @nx-go/nx-go@e2e`, {
      cwd: projectDirectory,
      stdio: 'inherit',
      env: process.env,
    });
  });

  afterAll(() => {
    // Cleanup the test project
    try {
      rmSync(projectDirectory, { recursive: true, force: true });
    } catch (ignored) {
      // ignored now, but need a closer look why resources are busy
    }
  });

  async function runNxCommandAsync(command: string) {
    return runCommandAsync(`nx ${command}`, { cwd: projectDirectory });
  }

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
    expect(readFile(`${appName}/go.mod`)).toContain('module proj');
    expect(readFile(`go.work`)).toContain(`use ./${appName}`);
  });

  it('should create a library', async () => {
    await runNxCommandAsync(`generate @nx-go/nx-go:library ${libName}`);

    expect(() => checkFilesExist(`${libName}/${libName}.go`)).not.toThrow();
    expect(() => checkFilesExist(`${libName}/go.mod`)).not.toThrow();
    expect(readFile(`${appName}/go.mod`)).toContain('module proj');
    expect(readFile(`go.work`)).toContain(`use (\n\t./${appName}\n\t./${libName}\n)`);
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

  it('should serve the application', async () => {
    const result = await runNxCommandAsync(`serve ${appName}`);
    expect(result.stdout).toContain(`Executing command: go run main.go`);
  });

  it('should test the application', async () => {
    const result = await runNxCommandAsync(`test ${appName} --skipRace`);
    expect(result.stdout).toContain(
      `Executing command: go test -v ./... -cover`
    );
  });
});
