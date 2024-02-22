import { joinPathFragments, readJsonFile, workspaceRoot } from '@nx/devkit';
import { execSync } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';

/**
 * Creates a test project with create-nx-workspace and installs the plugin
 */
export default function createTestProject(preset = 'apps') {
  const projectName = 'proj';
  const projectDirectory = join(process.cwd(), 'tmp', 'nx-e2e', projectName);

  // Ensure projectDirectory is empty
  rmSync(projectDirectory, { recursive: true, force: true });
  mkdirSync(dirname(projectDirectory), { recursive: true });

  // Extract current nx version
  const pkgJsonPath = joinPathFragments(workspaceRoot, 'package.json');
  const nxVersion = readJsonFile(pkgJsonPath).devDependencies['nx'];

  execSync(
    `npx --yes create-nx-workspace@${nxVersion} ${projectName} --preset ${preset} --no-nxCloud --no-interactive`,
    {
      cwd: dirname(projectDirectory),
      stdio: 'inherit',
      env: process.env,
    }
  );

  return projectDirectory;
}
