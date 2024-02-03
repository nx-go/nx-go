import type { NxJsonConfiguration, Tree } from '@nx/devkit';
import * as nxDevkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { GO_MOD_FILE, GO_WORK_FILE, NX_PLUGIN_NAME } from '../../constants';
import * as goBridge from './go-bridge';
import { addNxPlugin, ensureGoConfigInSharedGlobals } from './update-nx-json';

jest.mock('@nx/devkit');
jest.mock('./go-bridge', () => ({
  isGoWorkspace: jest.fn().mockReturnValue(false),
}));

describe('updateNxJson', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.resetAllMocks());

  describe('Method: addNxPlugin', () => {
    it('should add the plugin to the plugins array if not already included', () => {
      const nxJson = { plugins: [] } as NxJsonConfiguration;
      const spyUpdateNxJson = jest.spyOn(nxDevkit, 'updateNxJson');
      jest.spyOn(nxDevkit, 'readNxJson').mockReturnValue(nxJson);
      addNxPlugin(tree);
      expect(nxJson.plugins).toContain(NX_PLUGIN_NAME);
      expect(spyUpdateNxJson).toHaveBeenCalledTimes(1);
    });

    it('should not add the plugin to the plugins array if already included', () => {
      const nxJson = { plugins: [NX_PLUGIN_NAME] } as NxJsonConfiguration;
      const spyUpdateNxJson = jest.spyOn(nxDevkit, 'updateNxJson');
      jest.spyOn(nxDevkit, 'readNxJson').mockReturnValue(nxJson);
      addNxPlugin(tree);
      expect(nxJson.plugins).toEqual([NX_PLUGIN_NAME]);
      expect(spyUpdateNxJson).not.toHaveBeenCalled();
    });
  });

  describe('Method: ensureGoModInSharedGlobals', () => {
    it('should add go.mod entry to the sharedGlobals array if not already included', () => {
      const nxJson = { namedInputs: {} } as NxJsonConfiguration;
      const spyUpdateNxJson = jest.spyOn(nxDevkit, 'updateNxJson');
      jest.spyOn(nxDevkit, 'readNxJson').mockReturnValue(nxJson);
      ensureGoConfigInSharedGlobals(tree);
      expect(nxJson.namedInputs.sharedGlobals).toContain(
        `{workspaceRoot}/${GO_MOD_FILE}`
      );
      expect(spyUpdateNxJson).toHaveBeenCalledTimes(1);
    });

    it('should add workspace entries to the sharedGlobals array if not already included', () => {
      const nxJson = { namedInputs: {} } as NxJsonConfiguration;
      const spyUpdateNxJson = jest.spyOn(nxDevkit, 'updateNxJson');
      jest.spyOn(nxDevkit, 'readNxJson').mockReturnValue(nxJson);
      jest.spyOn(goBridge, 'isGoWorkspace').mockReturnValue(true);
      ensureGoConfigInSharedGlobals(tree);
      expect(nxJson.namedInputs.sharedGlobals).toEqual([
        `{workspaceRoot}/${GO_WORK_FILE}`,
        `{projectRoot}/${GO_MOD_FILE}`,
      ]);
      expect(spyUpdateNxJson).toHaveBeenCalledTimes(1);
    });

    it('should not add the entry to the sharedGlobals array if already included', () => {
      const nxJson = {
        namedInputs: { sharedGlobals: [`{workspaceRoot}/${GO_MOD_FILE}`] },
      } as NxJsonConfiguration;
      const spyUpdateNxJson = jest.spyOn(nxDevkit, 'updateNxJson');
      jest.spyOn(nxDevkit, 'readNxJson').mockReturnValue(nxJson);
      ensureGoConfigInSharedGlobals(tree);
      expect(nxJson.namedInputs.sharedGlobals).toEqual([
        `{workspaceRoot}/${GO_MOD_FILE}`,
      ]);
      expect(spyUpdateNxJson).not.toHaveBeenCalled();
    });
  });
});
