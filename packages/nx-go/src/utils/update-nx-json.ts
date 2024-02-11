import { readNxJson, Tree, updateNxJson } from '@nx/devkit';
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
  const entries = useWorkspace
    ? [`{workspaceRoot}/${GO_WORK_FILE}`]
    : [`{workspaceRoot}/${GO_MOD_FILE}`];

  const nxJson = readNxJson(tree);
  const namedInputs = nxJson.namedInputs ?? {};
  const sharedGlobals = namedInputs['sharedGlobals'] ?? [];

  if (entries.some((entry) => !sharedGlobals.includes(entry))) {
    namedInputs.sharedGlobals = Array.from(
      new Set([...sharedGlobals, ...entries])
    );
    updateNxJson(tree, { ...nxJson, namedInputs });
  }
};
