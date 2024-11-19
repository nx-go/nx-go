import { joinPathFragments, readJsonFile, workspaceRoot } from '@nx/devkit';
import { tmpProjPath } from '@nx/plugin/testing';
import { execSync } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import { dirname } from 'path';

/**
 * Creates a test project with create-nx-workspace and installs the plugin
 */
export default function createTestProject(preset = 'apps'): string {
  const projectName = 'proj';
  const projectDirectory = tmpProjPath();

  // Ensure projectDirectory is empty
  rmSync(projectDirectory, { recursive: true, force: true });
  mkdirSync(dirname(projectDirectory), { recursive: true });

  // Extract current nx version
  const pkgJsonPath = joinPathFragments(workspaceRoot, 'package.json');
  const nxVersion =
    process.env.NX_VERSION ?? readJsonFile(pkgJsonPath).devDependencies['nx'];

  execSync(
    `npx --yes create-nx-workspace@${nxVersion} ${projectName} --preset ${preset} --nxCloud skip --no-interactive`,
    {
      cwd: dirname(projectDirectory),
      stdio: 'inherit',
      env: process.env,
    }
  );

  return projectDirectory;
}
