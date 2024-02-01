import { joinPathFragments, readJsonFile, workspaceRoot } from '@nx/devkit';
import {
  checkFilesExist,
  readFile,
  runCommandAsync,
  uniq,
} from '@nx/plugin/testing';
import { execSync } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';

describe('nx-go', () => {
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
    rmSync(projectDirectory, { recursive: true, force: true });
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

  it('should create an application', async () => {
    const appName = uniq('app');
    await runNxCommandAsync(`generate @nx-go/nx-go:application ${appName}`);

    expect(() => checkFilesExist(`${appName}/main.go`)).not.toThrow();
    expect(() => checkFilesExist(`go.mod`)).not.toThrow();
    expect(() => checkFilesExist(`go.work`)).toThrow();
    expect(readFile(`go.mod`)).toContain('module proj');
  });

  it('should create a library', async () => {
    const libName = uniq('lib');
    await runNxCommandAsync(`generate @nx-go/nx-go:library ${libName}`);

    expect(() => checkFilesExist(`${libName}/${libName}.go`)).not.toThrow();
    expect(() => checkFilesExist(`go.mod`)).not.toThrow();
    expect(() => checkFilesExist(`go.work`)).toThrow();
    expect(readFile(`go.mod`)).toContain('module proj');
  });
});

/**
 * Creates a test project with create-nx-workspace and installs the plugin
 * @returns The directory where the test project was created
 */
function createTestProject() {
  const projectName = 'proj';
  const projectDirectory = join(process.cwd(), 'tmp', 'nx-e2e', projectName);

  // Ensure projectDirectory is empty
  rmSync(projectDirectory, { recursive: true, force: true });
  mkdirSync(dirname(projectDirectory), { recursive: true });

  // Extract current nx version
  const pkgJsonPath = joinPathFragments(workspaceRoot, 'package.json');
  const nxVersion = readJsonFile(pkgJsonPath).devDependencies['nx'];

  execSync(
    `pnpm dlx create-nx-workspace@${nxVersion} ${projectName} --preset apps --no-nxCloud --no-interactive --pm pnpm`,
    {
      cwd: dirname(projectDirectory),
      stdio: 'inherit',
      env: process.env,
    }
  );
  console.log(`Created test project in "${projectDirectory}"`);

  return projectDirectory;
}
