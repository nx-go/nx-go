import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Common Air configuration file names
 */
const AIR_CONFIG_FILES = [
  '.air.toml',
  '.air.yaml',
  '.air.yml',
  '.air.conf',
] as const;

/**
 * Checks if an Air configuration file exists in the project root.
 *
 * @param workspaceRoot the root of the workspace
 * @param projectRoot the root of the project (relative to workspace root)
 * @returns true if an Air config file exists, false otherwise
 */
export const hasAirConfig = (
  workspaceRoot: string,
  projectRoot: string
): boolean => {
  const absoluteProjectRoot = join(workspaceRoot, projectRoot);

  return AIR_CONFIG_FILES.some((configFile) =>
    existsSync(join(absoluteProjectRoot, configFile))
  );
};

/**
 * Checks if the Air executable is available in the system PATH.
 *
 * @returns true if the air executable is available, false otherwise
 */
export const isAirAvailable = (): boolean => {
  try {
    // Try to get the version to verify air is available
    execSync('air -v', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

/**
 * Checks if an Air serve target should be created for the project.
 * Returns true only if both the config file exists and air is available.
 *
 * @param workspaceRoot the root of the workspace
 * @param projectRoot the root of the project (relative to workspace root)
 * @returns true if air target should be created, false otherwise
 */
export const shouldCreateAirTarget = (
  workspaceRoot: string,
  projectRoot: string
): boolean => hasAirConfig(workspaceRoot, projectRoot) && isAirAvailable();
