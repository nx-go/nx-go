import { readdirSync, readFileSync, type Dirent } from 'node:fs';
import { findTestDependencies, readGoModules } from './find-test-dependencies';

jest.mock('node:fs');

const mockedReaddirSync = jest.mocked(readdirSync);
const mockedReadFileSync = jest.mocked(readFileSync);

const file = (name: string) =>
  ({ name, isFile: () => true, isDirectory: () => false }) as Dirent;
const directory = (name: string) =>
  ({ name, isFile: () => false, isDirectory: () => true }) as Dirent;

describe('Find test dependencies', () => {
  const mockFiles = (
    directories: Record<string, Dirent[]>,
    files: Record<string, string>,
  ) => {
    mockedReaddirSync.mockImplementation(
      ((path: string) => directories[path] ?? []) as never,
    );
    mockedReadFileSync.mockImplementation(
      ((path: string) => files[path] ?? '') as never,
    );
  };

  afterEach(() => jest.clearAllMocks());

  describe('Method: readGoModules', () => {
    it('should read module paths with the longest ones first', () => {
      mockFiles(
        {},
        {
          '/workspace/go.mod': 'module example.com/repo',
          '/workspace/libs/a/go.mod': 'module example.com/repo/libs/a',
          '/workspace/libs/b/go.mod': 'go 1.24',
        },
      );

      expect(
        readGoModules('/workspace', [
          'go.mod',
          'libs/a/go.mod',
          'libs/b/go.mod',
        ]),
      ).toEqual([
        { path: 'example.com/repo/libs/a', root: 'libs/a' },
        { path: 'example.com/repo', root: '.' },
      ]);
    });
  });

  describe('Method: findTestDependencies', () => {
    const modules = [
      { path: 'example.com/repo/libs/a', root: 'libs/a' },
      { path: 'example.com/repo/libs/b', root: 'libs/b' },
      { path: 'example.com/repo/libs/c', root: 'libs/c' },
    ];
    const testFile = (...imports: string[]) =>
      `package a_test\n\nimport (\n${imports
        .map((path) => `\t"${path}"`)
        .join('\n')}\n)`;

    it('should find the projects imported by test files', () => {
      mockFiles(
        {
          '/workspace/libs/a': [
            file('a.go'),
            file('a_test.go'),
            directory('sub'),
          ],
          '/workspace/libs/a/sub': [file('sub_test.go')],
        },
        {
          '/workspace/libs/a/a.go': testFile('example.com/repo/libs/z'),
          '/workspace/libs/a/a_test.go': testFile(
            'testing',
            'example.com/repo/libs/c/pkg',
          ),
          '/workspace/libs/a/sub/sub_test.go': testFile(
            'example.com/repo/libs/b',
            'example.com/repo/libs/c',
          ),
        },
      );

      expect(findTestDependencies('/workspace', 'libs/a', modules)).toEqual([
        'libs/b',
        'libs/c',
        'libs/c/pkg',
      ]);
      expect(mockedReadFileSync).not.toHaveBeenCalledWith(
        '/workspace/libs/a/a.go',
        'utf-8',
      );
    });

    it('should ignore imports of the project itself', () => {
      mockFiles(
        { '/workspace/libs/a': [file('a_test.go')] },
        {
          '/workspace/libs/a/a_test.go': testFile(
            'example.com/repo/libs/a',
            'example.com/repo/libs/a/internal',
            'example.com/repo/libs/abc',
          ),
        },
      );

      expect(findTestDependencies('/workspace', 'libs/a', modules)).toEqual([
        'libs/a/internal',
      ]);
    });

    it('should find directories of a module at the workspace root', () => {
      mockFiles(
        { '/workspace/libs/a': [file('a_test.go')] },
        {
          '/workspace/libs/a/a_test.go': testFile(
            'example.com/repo',
            'example.com/repo/libs/b/pkg',
          ),
        },
      );

      expect(
        findTestDependencies('/workspace', 'libs/a', [
          { path: 'example.com/repo', root: '.' },
        ]),
      ).toEqual(['libs', 'libs/b', 'libs/b/pkg']);
    });

    it.each`
      name
      ${'vendor'}
      ${'testdata'}
      ${'node_modules'}
      ${'.git'}
      ${'_tools'}
    `('should not go into the $name directory', ({ name }) => {
      mockFiles(
        {
          '/workspace/libs/a': [directory(name)],
          [`/workspace/libs/a/${name}`]: [file('ignored_test.go')],
        },
        {
          [`/workspace/libs/a/${name}/ignored_test.go`]: testFile(
            'example.com/repo/libs/b',
          ),
        },
      );

      expect(findTestDependencies('/workspace', 'libs/a', modules)).toEqual([]);
    });

    it('should not go into nested modules', () => {
      mockFiles(
        {
          '/workspace/libs/a': [file('go.mod'), directory('nested')],
          '/workspace/libs/a/nested': [file('go.mod'), file('nested_test.go')],
        },
        {
          '/workspace/libs/a/nested/nested_test.go': testFile(
            'example.com/repo/libs/b',
          ),
        },
      );

      expect(findTestDependencies('/workspace', 'libs/a', modules)).toEqual([]);
    });
  });
});
