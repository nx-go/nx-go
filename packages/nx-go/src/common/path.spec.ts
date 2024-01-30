import { ExecutorContext } from '@nx/devkit';
import { extractProjectRoot } from './path';

describe('path', () => {
  it('should use project configuration to extract its root', () => {
    const context: ExecutorContext = {
      projectName: 'proj',
      cwd: '',
      isVerbose: false,
      root: '/root',
      projectsConfigurations: {
        projects: { proj: { root: '/root/project' } },
        version: 1,
      },
    };
    expect(extractProjectRoot(context)).toBe('/root/project');
  });
});
