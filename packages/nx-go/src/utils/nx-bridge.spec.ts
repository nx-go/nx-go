import type { NxJsonConfiguration, Tree } from '@nx/devkit';
import * as nxDevkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { GO_MOD_FILE, GO_WORK_FILE, NX_PLUGIN_NAME } from '../constants';
import * as goBridge from './go-bridge';
import {
  addNxPlugin,
  ensureGoConfigInSharedGlobals,
  isProjectUsingNxGo,
} from './nx-bridge';

jest.mock('@nx/devkit');
jest.mock('./go-bridge', () => ({
  isGoWorkspace: jest.fn().mockReturnValue(false),
}));

describe('Nx bridge', () => {
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
    it.each`
      sharedGlobals                          | isGoWorkspace | updated  | expectedSharedGlobals                  | description
      ${[]}                                  | ${false}      | ${true}  | ${[`{workspaceRoot}/${GO_MOD_FILE}`]}  | ${'there is no go mod yet'}
      ${[`{workspaceRoot}/${GO_WORK_FILE}`]} | ${false}      | ${true}  | ${[`{workspaceRoot}/${GO_MOD_FILE}`]}  | ${'there is already a go work but need a go mod'}
      ${[]}                                  | ${true}       | ${true}  | ${[`{workspaceRoot}/${GO_WORK_FILE}`]} | ${'there is no go work yet'}
      ${[`{workspaceRoot}/${GO_WORK_FILE}`]} | ${true}       | ${false} | ${[`{workspaceRoot}/${GO_WORK_FILE}`]} | ${'there is already a go work'}
      ${[`{workspaceRoot}/${GO_MOD_FILE}`]}  | ${true}       | ${true}  | ${[`{workspaceRoot}/${GO_WORK_FILE}`]} | ${'there is already a go mod but need a go work'}
    `(
      'should modify sharedGlobals if $description',
      ({ sharedGlobals, isGoWorkspace, updated, expectedSharedGlobals }) => {
        const nxJson = {
          namedInputs: { sharedGlobals },
        } as NxJsonConfiguration;
        const spyUpdateNxJson = jest.spyOn(nxDevkit, 'updateNxJson');
        jest.spyOn(nxDevkit, 'readNxJson').mockReturnValue(nxJson);
        jest.spyOn(goBridge, 'isGoWorkspace').mockReturnValue(isGoWorkspace);
        ensureGoConfigInSharedGlobals(tree);
        expect(nxJson.namedInputs.sharedGlobals).toEqual(expectedSharedGlobals);
        expect(spyUpdateNxJson).toHaveBeenCalledTimes(updated ? 1 : 0);
      }
    );
  });

  describe('Method: isProjectUsingNxGo', () => {
    it('should return false when the project is using nx-go', () => {
      expect(isProjectUsingNxGo({ root: '', targets: {} })).toBeFalsy();
    });

    it('should return true when the project is using nx-go', () => {
      expect(
        isProjectUsingNxGo({
          root: '',
          targets: {
            serve: { executor: `${NX_PLUGIN_NAME}:serve` },
          },
        })
      ).toBeTruthy();
    });
  });
});
