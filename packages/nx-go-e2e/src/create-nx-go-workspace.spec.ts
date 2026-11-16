import {
  checkFilesExist,
  cleanup,
  ensureNxProject,
  readJson,
  runNxCommand,
  runNxCommandAsync,
  updateFile,
} from '@nx/plugin/testing';

describe('nx-go: create workspace', () => {
  beforeAll(() => {
    ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go');
    runNxCommand('generate @nx-go/nx-go:init');
  });
  afterAll(() => cleanup());

  it('should be able to convert the workspace to one Go module', () => {
    runNxCommand('generate @nx-go/nx-go:convert-to-one-mod');
    expect(() => checkFilesExist(`go.mod`)).not.toThrow();
    expect(() => checkFilesExist(`go.work`)).toThrow();
  });

  describe('Project globs', () => {
    beforeAll(() => {
      updateFile('go.mod', 'module example.com/repo\n');
      updateFile(
        'apps/api/main.go',
        `package main

        import (
          "fmt"
          "example.com/repo/libs/shared"
        )

        func main() {
          fmt.Println(shared.Hello())
        }`,
      );
      updateFile(
        'libs/shared/shared.go',
        `package shared

        func Hello() string {
          return "Hello"
        }`,
      );
      updateFile('libs/shared/internal/internal.go', 'package internal');
      updateFile(
        'libs/shared/sub/sub_test.go',
        `package sub

        import "testing"

        func TestSub(t *testing.T) {}`,
      );

      const nxJson = readJson('nx.json');
      nxJson.plugins = [
        {
          plugin: '@nx-go/nx-go',
          options: { projectGlobs: ['apps/*', 'libs/*', 'libs/*/sub'] },
        },
      ];
      updateFile('nx.json', JSON.stringify(nxJson, null, 2));
    });

    it('should create a project per matching directory', async () => {
      const result = await runNxCommandAsync('show projects --json');

      expect(JSON.parse(result.stdout).sort()).toEqual([
        'apps/api',
        'libs/shared',
        'libs/shared/sub',
      ]);
    });

    it('should create graph with dependencies', async () => {
      await runNxCommandAsync('dep-graph --file=graph.json');
      const { graph } = readJson('graph.json');

      expect(graph.dependencies['apps/api']).toEqual([
        expect.objectContaining({ target: 'libs/shared' }),
      ]);
      expect(graph.dependencies['libs/shared']).toEqual([]);
    });

    it('should only test the packages of the project', async () => {
      const result = await runNxCommandAsync('test libs/shared');
      expect(result.stdout).toContain(
        'Executing command: go test . ./internal/...',
      );

      const nestedResult = await runNxCommandAsync('test libs/shared/sub');
      expect(nestedResult.stdout).toContain('Executing command: go test ./...');
    });
  });
});
