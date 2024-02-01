import { readNxJson, Tree, updateNxJson } from '@nx/devkit';
import { GO_MOD_FILE, NX_PLUGIN_NAME } from '../../constants';

export const addNxPlugin = (tree: Tree): void => {
  const nxJson = readNxJson(tree);
  if (!nxJson.plugins?.includes(NX_PLUGIN_NAME)) {
    nxJson.plugins = [...(nxJson.plugins || []), NX_PLUGIN_NAME];
    updateNxJson(tree, nxJson);
  }
};

export const addGoModToSharedGlobals = (tree: Tree): void => {
  if (!tree.exists(GO_MOD_FILE)) {
    return;
  }

  const entry = `{workspaceRoot}/${GO_MOD_FILE}`;
  const nxJson = readNxJson(tree);

  const namedInputs = nxJson.namedInputs;
  const sharedGlobals = namedInputs['sharedGlobals'] ?? [];
  if (!sharedGlobals.includes(entry)) {
    nxJson.namedInputs = {
      ...namedInputs,
      sharedGlobals: [...sharedGlobals, entry],
    };
    updateNxJson(tree, nxJson);
  }
};
