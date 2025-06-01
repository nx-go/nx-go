import type { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as child_process from 'child_process';
import { join } from 'path';
import { GO_WORK_FILE } from '../constants';
import {
  addGoWorkDependency,
  createGoMod,
  createGoWork,
  getGoModules,
  getGoShortVersion,
  getGoVersion,
  isGoWorkspace,
  parseGoList,
  supportsGoWorkspace,
} from './go-bridge';

jest.mock('child_process', () => ({
  execSync: jest
    .fn()
    .mockReturnValue(
      Buffer.from('go version go1.21.1 windows/amd64\n', 'utf-8')
    ),
}));

describe('Go bridge', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));

  describe('Method: getGoVersion', () => {
    it('should return go version', () => {
      expect(getGoVersion()).toEqual('1.21.1');
    });

    it('should throw error if go version not found', () => {
      jest.spyOn(child_process, 'execSync').mockImplementationOnce(() => null);
      expect(() => getGoVersion()).toThrow(
        'Cannot retrieve current Go version'
      );
    });
  });

  describe('Method: getGoShortVersion', () => {
    it('should return go version without patch number', () => {
      expect(getGoShortVersion()).toEqual('1.21');
    });

    it('should throw error if go version not found', () => {
      jest.spyOn(child_process, 'execSync').mockImplementationOnce(() => null);
      expect(() => getGoShortVersion()).toThrow(
        'Cannot retrieve current Go version'
      );
    });
  });

  describe('Method: getGoModules', () => {
    it('should return output of go list -m -json command', () => {
      const mockOutput = '{"Path":"example.com/module","Version":"v1.0.0"}';
      jest.spyOn(child_process, 'execSync').mockReturnValueOnce(mockOutput);
      const result = getGoModules('/path/to/project', false);
      expect(result).toEqual(mockOutput);
    });

    it('should return empty string if command fails and failSilently is true', () => {
      jest.spyOn(child_process, 'execSync').mockImplementationOnce(() => {
        throw new Error('Command failed');
      });
      const result = getGoModules('/path/to/project', true);
      expect(result).toEqual('');
    });

    it('should throw error if command fails and failSilently is false', () => {
      jest.spyOn(child_process, 'execSync').mockImplementationOnce(() => {
        throw new Error('Command failed');
      });
      expect(() => getGoModules('/path/to/project', false)).toThrow(
        'Command failed'
      );
    });
  });

  describe('Method: supportsGoWorkspace', () => {
    it.each`
      version     | expected
      ${'0.1'}    | ${false}
      ${'1.17'}   | ${false}
      ${'1.18'}   | ${true}
      ${'1.18.5'} | ${true}
      ${'1.20'}   | ${true}
      ${'2.10'}   | ${true}
    `(
      'should return $expected if version is $version',
      ({ version, expected }) => {
        jest
          .spyOn(child_process, 'execSync')
          .mockReturnValueOnce(
            Buffer.from(`go version go${version} windows/amd64`, 'utf-8')
          );
        expect(supportsGoWorkspace()).toBe(expected);
      }
    );
  });

  describe('Method: isGoWorkspace', () => {
    it('should return true if go.work exists', () => {
      jest.spyOn(tree, 'exists').mockReturnValue(true);
      expect(isGoWorkspace(tree)).toBeTruthy();
    });

    it('should return false if go.work not exists', () => {
      jest.spyOn(tree, 'exists').mockReturnValue(false);
      expect(isGoWorkspace(tree)).toBeFalsy();
    });
  });

  describe('Method: parseGoList', () => {
    it('should parse Go list with multiple items', () => {
      const result = parseGoList('use', 'use (./a\n  ./b\n./c  )');
      expect(result).toEqual(['./a', './b', './c']);
    });

    it('should parse Go list with only one item', () => {
      const result = parseGoList('import', 'import "fmt"');
      expect(result).toEqual(['fmt']);
    });

    it('should parse Go list with no item', () => {
      const result = parseGoList('use', 'package pkg');
      expect(result).toEqual([]);
    });
  });

  describe('Method: createGoMod', () => {
    it('should write go.mod if not exists', () => {
      const spyWrite = jest.spyOn(tree, 'write');
      jest.spyOn(tree, 'exists').mockReturnValue(false);
      createGoMod(tree, 'moduleName', 'libs/data-access');
      expect(spyWrite).toHaveBeenCalledWith(
        join('libs/data-access', 'go.mod'),
        'module moduleName\n\ngo 1.21\n'
      );
    });

    it('should not write go.mod if exists', async () => {
      const spyWrite = jest.spyOn(tree, 'write');
      jest.spyOn(tree, 'exists').mockReturnValue(true);
      createGoMod(tree, 'pkg');
      expect(spyWrite).not.toHaveBeenCalled();
    });
  });

  describe('Method: createGoWork', () => {
    it('should write go.work if not exists', () => {
      const spyWrite = jest.spyOn(tree, 'write');
      jest.spyOn(tree, 'exists').mockReturnValue(false);
      createGoWork(tree);
      expect(spyWrite).toHaveBeenCalledWith(GO_WORK_FILE, 'go 1.21\n');
    });

    it('should not write go.work if exists', async () => {
      const spyWrite = jest.spyOn(tree, 'write');
      jest.spyOn(tree, 'exists').mockReturnValue(true);
      createGoWork(tree);
      expect(spyWrite).not.toHaveBeenCalled();
    });
  });

  describe('Method: addGoWorkDependency', () => {
    const setNextGoWorkContent = (content: string) =>
      jest
        .spyOn(tree, 'read')
        .mockReturnValueOnce(
          Buffer.from(content, 'utf-8') as unknown as string
        );

    it.each`
      content                                        | newContent
      ${'go 1.21\n'}                                 | ${'go 1.21\n\nuse ./new-app\n'}
      ${'go 1.21\n\nuse ./app1\n'}                   | ${'go 1.21\n\nuse (\n\t./app1\n\t./new-app\n)\n'}
      ${'go 1.21\n\nuse (\n\t./app1\n\t./app2\n)\n'} | ${'go 1.21\n\nuse (\n\t./app1\n\t./app2\n\t./new-app\n)\n'}
    `(
      'should add new dependency to go.work with content $content',
      ({ content, newContent }) => {
        setNextGoWorkContent(content);
        const spyWrite = jest.spyOn(tree, 'write');
        addGoWorkDependency(tree, 'new-app');
        expect(spyWrite).toHaveBeenCalledWith(GO_WORK_FILE, newContent);
      }
    );

    it('should not add new dependency to go.work if already exists', () => {
      setNextGoWorkContent('go 1.21\n\nuse ./app1\n');
      const spyWrite = jest.spyOn(tree, 'write');
      addGoWorkDependency(tree, 'app1');
      expect(spyWrite).not.toHaveBeenCalled();
    });
  });
});
