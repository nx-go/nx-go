import {
  type ProjectConfiguration,
  readNxJson,
  type TargetConfiguration,
  type Tree,
  updateNxJson,
} from '@nx/devkit';
import { GO_MOD_FILE, GO_WORK_FILE, NX_PLUGIN_NAME } from '../constants';
import { isGoWorkspace } from './go-bridge';

/**
 * Adds the nx-go plugin to the nx.json if it's not already there.
 *
 * @param tree project tree object
 */
export const addNxPlugin = (tree: Tree): void => {
  const nxJson = readNxJson(tree);
  const plugins = nxJson.plugins || [];

  // Check if plugin already exists (as string or object)
  const pluginExists = plugins.some((plugin) => {
    if (typeof plugin === 'string') {
      return plugin === NX_PLUGIN_NAME;
    }
    return plugin.plugin === NX_PLUGIN_NAME;
  });

  if (!pluginExists) {
    nxJson.plugins = [...plugins, NX_PLUGIN_NAME];
    updateNxJson(tree, nxJson);
  }
};

/**
 * Ensures that go configuration files are included as a sharedGlobal,
 * so any changes will trigger projects to be flagged as affected.
 *
 * @deprecated Since v4.0.0. Go files (go.work, go.mod) are now explicitly included
 * in GO_PROJECT_INPUTS for all Go targets, making their presence in sharedGlobals
 * redundant. This function is kept for backward compatibility with the v3.0.0 migration.
 *
 * @param tree project tree object
 */
export const ensureGoConfigInSharedGlobals = (tree: Tree): void => {
  const useWorkspace = isGoWorkspace(tree);
  const toAdd = `{workspaceRoot}/${useWorkspace ? GO_WORK_FILE : GO_MOD_FILE}`;
  const toRem = `{workspaceRoot}/${useWorkspace ? GO_MOD_FILE : GO_WORK_FILE}`;

  const nxJson = readNxJson(tree);
  const namedInputs = nxJson.namedInputs ?? {};
  const sharedGlobals = namedInputs['sharedGlobals'] ?? [];

  if (!sharedGlobals.includes(toAdd) || sharedGlobals.includes(toRem)) {
    namedInputs.sharedGlobals = Array.from(
      new Set([...sharedGlobals.filter((item) => item !== toRem), toAdd])
    );
    updateNxJson(tree, { ...nxJson, namedInputs });
  }
};

/**
 * Checks if a Nx project is using the nx-go plugin.
 *
 * @param project project configuration object
 */
export const isProjectUsingNxGo = (project: ProjectConfiguration): boolean =>
  Object.values(project.targets).some((target: TargetConfiguration) =>
    target.executor.includes(NX_PLUGIN_NAME)
  );
