import type { NxJsonConfiguration, Tree } from '@nx/devkit';
import * as nxDevkit from '@nx/devkit';
import { GO_MOD_FILE, NX_PLUGIN_NAME } from '../../constants';
import { addGoModToSharedGlobals, addNxPlugin } from './update-nx-json';

jest.mock('@nx/devkit');

describe('updateNxJson', () => {
  afterEach(() => jest.resetAllMocks());

  describe('Method: addNxPlugin', () => {
    it('should add the plugin to the plugins array if not already included', () => {
      const nxJson = { plugins: [] } as NxJsonConfiguration;
      const spyUpdateNxJson = jest.spyOn(nxDevkit, 'updateNxJson');
      jest.spyOn(nxDevkit, 'readNxJson').mockReturnValue(nxJson);
      addNxPlugin({} as Tree);
      expect(nxJson.plugins).toContain(NX_PLUGIN_NAME);
      expect(spyUpdateNxJson).toHaveBeenCalledTimes(1);
    });

    it('should not add the plugin to the plugins array if already included', () => {
      const nxJson = { plugins: [NX_PLUGIN_NAME] } as NxJsonConfiguration;
      const spyUpdateNxJson = jest.spyOn(nxDevkit, 'updateNxJson');
      jest.spyOn(nxDevkit, 'readNxJson').mockReturnValue(nxJson);
      addNxPlugin({} as Tree);
      expect(nxJson.plugins).toEqual([NX_PLUGIN_NAME]);
      expect(spyUpdateNxJson).not.toHaveBeenCalled();
    });
  });

  describe('Method: addGoModToSharedGlobals', () => {
    it('should add the entry to the sharedGlobals array if not already included', () => {
      const nxJson = { namedInputs: {} } as NxJsonConfiguration;
      const spyUpdateNxJson = jest.spyOn(nxDevkit, 'updateNxJson');
      jest.spyOn(nxDevkit, 'readNxJson').mockReturnValue(nxJson);
      addGoModToSharedGlobals({
        exists: jest.fn().mockReturnValue(true) as unknown,
      } as Tree);
      expect(nxJson.namedInputs.sharedGlobals).toContain(
        `{workspaceRoot}/${GO_MOD_FILE}`
      );
      expect(spyUpdateNxJson).toHaveBeenCalledTimes(1);
    });

    it('should not add the entry to the sharedGlobals array if already included', () => {
      const nxJson = {
        namedInputs: { sharedGlobals: [`{workspaceRoot}/${GO_MOD_FILE}`] },
      } as NxJsonConfiguration;
      const spyUpdateNxJson = jest.spyOn(nxDevkit, 'updateNxJson');
      jest.spyOn(nxDevkit, 'readNxJson').mockReturnValue(nxJson);
      addGoModToSharedGlobals({
        exists: jest.fn().mockReturnValue(true) as unknown,
      } as Tree);
      expect(nxJson.namedInputs.sharedGlobals).toEqual([
        `{workspaceRoot}/${GO_MOD_FILE}`,
      ]);
      expect(spyUpdateNxJson).not.toHaveBeenCalled();
    });

    it('should not add the entry to the sharedGlobals array if the file does not exist', () => {
      const spyReadNxJson = jest.spyOn(nxDevkit, 'readNxJson');
      addGoModToSharedGlobals({
        exists: jest.fn().mockReturnValue(false) as unknown,
      } as Tree);
      expect(spyReadNxJson).not.toHaveBeenCalled();
    });
  });
});
