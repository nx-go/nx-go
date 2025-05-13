import { createNodesV2 } from './create-nodes';

describe('Create nodes', () => {
  it('should compute all go.mod files', () => {
    expect(createNodesV2[0]).toEqual('**/go.mod');
  });

  it('should process a go.mod file inside an underlying project', () => {
    const result = createNodesV2[1](
      ['/tmp/my-project/libs/api/go.mod'],
      null,
      null
    );
    expect(result).toEqual([
      [
        '/tmp/my-project/libs/api/go.mod',
        {
          projects: {
            api: {
              name: 'api',
              root: '/tmp/my-project/libs/api',
              targets: {},
            },
          },
        },
      ],
    ]);
  });

  it('should process a go.mod file at the root workspace', () => {
    const result = createNodesV2[1](['./go.mod'], null, null);
    expect(result).toEqual([['./go.mod', {}]]);
  });
});
