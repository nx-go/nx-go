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
  if (!nxJson.plugins?.includes(NX_PLUGIN_NAME)) {
    nxJson.plugins = [...(nxJson.plugins || []), NX_PLUGIN_NAME];
    updateNxJson(tree, nxJson);
  }
};

/**
 * Ensures that go configuration files are included as a sharedGlobal,
 * so any changes will trigger projects to be flagged as affected.
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
