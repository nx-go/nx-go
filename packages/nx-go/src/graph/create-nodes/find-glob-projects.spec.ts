import { readdirSync, type Dirent } from 'node:fs';
import { findGlobProjects } from './find-glob-projects';

jest.mock('node:fs');

const mockedReaddirSync = jest.mocked(readdirSync);

const file = (name: string) =>
  ({ name, isFile: () => true, isDirectory: () => false }) as Dirent;
const directory = (name: string) =>
  ({ name, isFile: () => false, isDirectory: () => true }) as Dirent;

describe('findGlobProjects', () => {
  const mockDirectories = (directories: Record<string, Dirent[]>) =>
    mockedReaddirSync.mockImplementation(
      ((path: string) => directories[path] ?? []) as never,
    );

  afterEach(() => jest.clearAllMocks());

  it('should find directories matching a pattern', () => {
    mockDirectories({
      '/workspace': [file('go.mod'), directory('apps'), directory('libs')],
      '/workspace/apps': [directory('api')],
      '/workspace/apps/api': [file('main.go'), directory('internal')],
      '/workspace/apps/api/internal': [file('internal.go')],
      '/workspace/libs': [directory('a'), directory('b')],
      '/workspace/libs/a': [file('a.go'), file('a_test.go')],
      '/workspace/libs/b': [file('b.go')],
    });

    expect(findGlobProjects('/workspace', ['apps/*', 'libs/*'])).toEqual([
      { root: 'apps/api' },
      { root: 'libs/a' },
      { root: 'libs/b' },
      { root: '.', packages: [] },
    ]);
  });

  it('should find a directory with Go files in sub directories only', () => {
    mockDirectories({
      '/workspace': [directory('apps')],
      '/workspace/apps': [directory('api')],
      '/workspace/apps/api': [directory('cmd')],
      '/workspace/apps/api/cmd': [directory('api')],
      '/workspace/apps/api/cmd/api': [file('main.go')],
    });

    expect(findGlobProjects('/workspace', ['apps/*'])).toEqual([
      { root: 'apps/api' },
      { root: '.', packages: [] },
    ]);
  });

  it('should ignore directories without Go files', () => {
    mockDirectories({
      '/workspace': [directory('libs')],
      '/workspace/libs': [directory('a'), directory('docs')],
      '/workspace/libs/a': [file('a.go')],
      '/workspace/libs/docs': [file('README.md')],
    });

    expect(findGlobProjects('/workspace', ['libs/*'])).toEqual([
      { root: 'libs/a' },
      { root: '.', packages: [] },
    ]);
  });

  it('should only return the module without matching directory', () => {
    mockDirectories({
      '/workspace': [file('root.go'), directory('libs')],
      '/workspace/libs': [directory('a')],
      '/workspace/libs/a': [file('a.go')],
    });

    expect(findGlobProjects('/workspace', ['apps/*'])).toEqual([{ root: '.' }]);
  });

  it('should keep packages of nested projects out of their parent', () => {
    mockDirectories({
      '/workspace': [directory('libs')],
      '/workspace/libs': [directory('a')],
      '/workspace/libs/a': [
        file('a.go'),
        directory('internal'),
        directory('sub'),
      ],
      '/workspace/libs/a/internal': [file('internal.go'), directory('db')],
      '/workspace/libs/a/internal/db': [file('db.go')],
      '/workspace/libs/a/sub': [file('sub.go')],
    });

    expect(findGlobProjects('/workspace', ['libs/*', 'libs/*/sub'])).toEqual([
      { root: 'libs/a/sub' },
      { root: 'libs/a', packages: ['.', './internal/...'] },
      { root: '.', packages: [] },
    ]);
  });

  it('should leave packages outside of the patterns to the module', () => {
    mockDirectories({
      '/workspace': [file('root.go'), directory('libs'), directory('tools')],
      '/workspace/libs': [directory('a')],
      '/workspace/libs/a': [
        file('a.go'),
        directory('internal'),
        directory('sub'),
      ],
      '/workspace/libs/a/internal': [file('internal.go')],
      '/workspace/libs/a/sub': [file('sub.go')],
      '/workspace/tools': [directory('gen')],
      '/workspace/tools/gen': [file('main.go')],
    });

    expect(findGlobProjects('/workspace', ['libs/*/sub'])).toEqual([
      { root: 'libs/a/sub' },
      {
        root: '.',
        packages: ['.', './libs/a', './libs/a/internal/...', './tools/...'],
      },
    ]);
  });

  it('should find one project per package', () => {
    mockDirectories({
      '/workspace': [directory('libs')],
      '/workspace/libs': [directory('a')],
      '/workspace/libs/a': [file('a.go'), directory('b')],
      '/workspace/libs/a/b': [directory('c')],
      '/workspace/libs/a/b/c': [file('c.go'), directory('d')],
      '/workspace/libs/a/b/c/d': [file('d.go')],
    });

    expect(findGlobProjects('/workspace', ['**'])).toEqual([
      { root: 'libs/a/b/c/d' },
      { root: 'libs/a/b/c', packages: ['.'] },
      { root: 'libs/a', packages: ['.'] },
      { root: '.', packages: [] },
    ]);
  });

  it.each`
    name
    ${'vendor'}
    ${'testdata'}
    ${'node_modules'}
    ${'.git'}
    ${'_tools'}
  `('should ignore the $name directory', ({ name }) => {
    mockDirectories({
      '/workspace': [directory(name), directory('libs')],
      [`/workspace/${name}`]: [file('ignored.go')],
      '/workspace/libs': [file('libs.go')],
    });

    expect(findGlobProjects('/workspace', ['**'])).toEqual([
      { root: 'libs' },
      { root: '.', packages: [] },
    ]);
  });

  it('should not go into nested modules', () => {
    mockDirectories({
      '/workspace': [directory('libs'), directory('nested')],
      '/workspace/libs': [file('libs.go')],
      '/workspace/nested': [file('go.mod'), file('nested.go')],
    });
    expect(findGlobProjects('/workspace', ['**'])).toEqual([
      { root: 'libs' },
      { root: '.', packages: [] },
    ]);
  });
});
