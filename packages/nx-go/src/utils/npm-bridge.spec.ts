import * as nxDevkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { getProjectScope } from './npm-bridge';

jest.mock('@nx/devkit');

describe('Npm bridge', () => {
  describe('Method: getProjectScope', () => {
    it('should return project scope', () => {
      jest
        .spyOn(nxDevkit, 'readJson')
        .mockReturnValueOnce({ name: '@nx-go/nx-go' });
      expect(getProjectScope(createTreeWithEmptyWorkspace())).toBe('nx-go');
    });
  });
});
