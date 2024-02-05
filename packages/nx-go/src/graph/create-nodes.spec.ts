import { createNodes } from './create-nodes';

describe('Create nodes', () => {
  it('should compute all go.mod files', () => {
    expect(createNodes[0]).toEqual('**/go.mod');
  });

  it('should process a go.mod file inside an underlying project', () => {
    const result = createNodes[1](
      '/tmp/my-project/libs/api/go.mod',
      null,
      null
    );
    expect(result).toEqual({
      projects: {
        api: {
          name: 'api',
          root: '/tmp/my-project/libs/api',
          targets: {},
        },
      },
    });
  });

  it('should process a go.mod file at the root workspace', () => {
    const result = createNodes[1]('./go.mod', null, null);
    expect(result).toEqual({});
  });
});
