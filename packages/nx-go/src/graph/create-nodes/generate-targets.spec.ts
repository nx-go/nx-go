import { type TargetConfiguration } from '@nx/devkit';
import { NX_PLUGIN_NAME } from '../../constants';
import { NxGoPluginOptions } from '../../type';
import { generateTargets } from './generate-targets';

describe('generateTargets', () => {
  const mockOptions: NxGoPluginOptions = {
    buildTargetName: 'build',
    serveTargetName: 'serve',
    testTargetName: 'test',
    lintTargetName: 'lint',
    tidyTargetName: 'tidy',
  };

  describe('when isApplication is true', () => {
    it('should generate all targets including build and serve', () => {
      const result = generateTargets(mockOptions, true);

      expect(Object.keys(result)).toEqual([
        'build',
        'serve',
        'test',
        'lint',
        'tidy',
      ]);
    });

    it('should create a build target with correct configuration', () => {
      const result = generateTargets(mockOptions, true);

      expect(result['build']).toEqual({
        executor: `${NX_PLUGIN_NAME}:build`,
        cache: true,
        inputs: expect.arrayOf(expect.any(String)),
        outputs: ['{options.outputPath}'],
        metadata: expect.anything(),
      } as TargetConfiguration);
    });

    it('should create a serve target with correct configuration', () => {
      const result = generateTargets(mockOptions, true);

      expect(result['serve']).toEqual({
        executor: `${NX_PLUGIN_NAME}:serve`,
        metadata: expect.anything(),
      } as TargetConfiguration);
    });
  });

  it('should create a test target with correct configuration', () => {
    const result = generateTargets(mockOptions, true);

    expect(result['test']).toEqual({
      executor: `${NX_PLUGIN_NAME}:test`,
      cache: true,
      inputs: expect.arrayOf(expect.any(String)),
      outputs: ['{options.coverProfile}'],
      metadata: expect.anything(),
    } as TargetConfiguration);
  });

  it('should create a lint target with correct configuration', () => {
    const result = generateTargets(mockOptions, true);

    expect(result['lint']).toEqual({
      executor: `${NX_PLUGIN_NAME}:lint`,
      cache: true,
      inputs: expect.arrayOf(expect.any(String)),
      metadata: expect.anything(),
    } as TargetConfiguration);
  });

  it('should create a tidy target with correct configuration', () => {
    const result = generateTargets(mockOptions, true);

    expect(result['tidy']).toEqual({
      executor: `${NX_PLUGIN_NAME}:tidy`,
      cache: true,
      inputs: expect.arrayOf(expect.any(String)),
      outputs: ['{projectRoot}/go.sum'],
      metadata: expect.anything(),
    } as TargetConfiguration);
  });

  it('should not include build and serve targets when isApplication is false', () => {
    const result = generateTargets(mockOptions, false);

    expect(result['build']).toBeUndefined();
    expect(result['serve']).toBeUndefined();
  });
});
