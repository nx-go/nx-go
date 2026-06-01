import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Common Revive configuration file names
 */
const REVIVE_CONFIG_FILES = ['revive.toml', '.revive.toml'] as const;

/**
 * Inputs required for linting with Revive,
 * based on the common Revive configuration files.
 */
export const REVIVE_INPUTS = REVIVE_CONFIG_FILES.map(
  (file) => `{projectRoot}/${file}`
);

/**
 * Checks if a Revive configuration file exists in the project root.
 *
 * @param workspaceRoot the root of the workspace
 * @param projectRoot the root of the project (relative to workspace root)
 * @returns true if a Revive config file exists, false otherwise
 */
export const hasReviveConfig = (
  workspaceRoot: string,
  projectRoot: string
): boolean => {
  const absoluteProjectRoot = join(workspaceRoot, projectRoot);

  return REVIVE_CONFIG_FILES.some((configFile) =>
    existsSync(join(absoluteProjectRoot, configFile))
  );
};

let cachedReviveAvailability: boolean | null = null;

/**
 * Checks if the Revive executable is available in the system PATH.
 * This function caches the result after the first check to avoid redundant executions in subsequent calls.
 *
 * @returns true if the revive executable is available, false otherwise
 */
export const isReviveAvailable = (): boolean => {
  if (cachedReviveAvailability !== null) {
    return cachedReviveAvailability;
  }

  try {
    execSync('revive -version', { stdio: 'ignore' });
    cachedReviveAvailability = true;
  } catch {
    cachedReviveAvailability = false;
  }

  return cachedReviveAvailability;
};

/**
 * Checks if the Revive linter should be used for the project.
 * Returns true only if both the config file exists and revive is available.
 *
 * @param workspaceRoot the root of the workspace
 * @param projectRoot the root of the project (relative to workspace root)
 * @returns true if revive should be used as linter, false otherwise
 */
export const shouldUseReviveLinter = (
  workspaceRoot: string,
  projectRoot: string
): boolean =>
  hasReviveConfig(workspaceRoot, projectRoot) && isReviveAvailable();
