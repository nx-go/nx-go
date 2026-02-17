import { type TargetConfiguration } from '@nx/devkit';
import { GO_MOD_FILE, NX_PLUGIN_NAME } from '../../constants';
import { NxGoPluginNodeOptions } from '../../type';
import { generateTargets } from './generate-targets';

describe('generateTargets', () => {
  const mockOptions: NxGoPluginNodeOptions = {
    buildTargetName: 'build',
    serveTargetName: 'serve',
    serveAirTargetName: 'serve:air',
    testTargetName: 'test',
    lintTargetName: 'lint',
    tidyTargetName: 'tidy',
    generateTargetName: 'generate',
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
        'generate',
      ]);
    });

    it('should create a build target with correct configuration', () => {
      const result = generateTargets(mockOptions, true);

      expect(result['build']).toEqual({
        executor: `${NX_PLUGIN_NAME}:build`,
        cache: true,
        inputs: expect.arrayOf(expect.any(String)),
        outputs: ['{workspaceRoot}/dist/{projectRoot}*'],
        metadata: expect.anything(),
      } as TargetConfiguration);
    });

    it('should create a serve target with correct configuration', () => {
      const result = generateTargets(mockOptions, true);

      expect(result['serve']).toEqual({
        executor: `${NX_PLUGIN_NAME}:serve`,
        continuous: true,
        metadata: expect.anything(),
      } as TargetConfiguration);
    });

    it('should create air target with default name when hasAirSetup is true', () => {
      const result = generateTargets(mockOptions, true, true);

      expect(result['serve:air']).toEqual({
        executor: `${NX_PLUGIN_NAME}:serve-air`,
        continuous: true,
        metadata: expect.anything(),
      } as TargetConfiguration);
    });

    it('should not create air target when hasAirSetup is false', () => {
      const result = generateTargets(mockOptions, true, false);

      expect(result['serve:air']).toBeUndefined();
    });
  });

  it('should create a test target with correct configuration', () => {
    const result = generateTargets(mockOptions, true);

    expect(result['test']).toEqual({
      executor: `${NX_PLUGIN_NAME}:test`,
      cache: true,
      inputs: expect.arrayOf(expect.any(String)),
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
      outputs: [`{projectRoot}/${GO_MOD_FILE}`, '{projectRoot}/go.sum'],
      metadata: expect.anything(),
    } as TargetConfiguration);
  });

  it('should create a generate target with correct configuration', () => {
    const result = generateTargets(mockOptions, true);

    expect(result['generate']).toEqual({
      executor: `${NX_PLUGIN_NAME}:generate`,
      cache: true,
      inputs: expect.arrayOf(expect.any(String)),
      metadata: expect.anything(),
    } as TargetConfiguration);
  });

  it('should not include build and serve targets when isApplication is false', () => {
    const result = generateTargets(mockOptions, false);

    expect(result['build']).toBeUndefined();
    expect(result['serve']).toBeUndefined();
  });
});
