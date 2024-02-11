import { execSync } from 'child_process';
import { rmSync } from 'fs';
import createTestProject from '../shared/create-test-project';

describe('nx-go: create workspace', () => {
  let workspaceDirectory: string;

  beforeAll(() => {
    workspaceDirectory = createTestProject('@nx-go/nx-go');
  });

  afterAll(() => {
    rmSync(workspaceDirectory, { recursive: true, force: true });
  });

  it('should be installed', () => {
    // npm ls will fail if the package is not installed properly
    execSync('npm ls @nx-go/nx-go', {
      cwd: workspaceDirectory,
      stdio: 'inherit',
    });
  });
});
