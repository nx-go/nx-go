import type { TargetConfiguration } from '@nx/devkit';
import {
  GO_MOD_FILE,
  GO_PROJECT_INPUTS,
  NX_PLUGIN_NAME,
} from '../../constants';
import type { NxGoPluginNodeOptions } from '../../type';

/**
 * Generates a set of default targets for a Go project based on whether it's an application or a library.
 * Applications get build and serve targets, while both applications and libraries get test, lint, and tidy targets.
 *
 * @param options - The plugin options containing target names
 * @param isApplication - A boolean indicating if the project is an application (has package main) or a library
 * @param hasAirSetup - A boolean indicating if Air config exists and air executable is available
 * @returns An object containing the generated targets for the project
 * @see https://nx.dev/docs/extending-nx/project-graph-plugins#identifying-projects
 */
export const generateTargets = (
  options: NxGoPluginNodeOptions,
  isApplication: boolean,
  hasAirSetup = false
): Record<string, TargetConfiguration> => {
  const targets: Record<string, TargetConfiguration> = {};

  // Build and Serve targets - only for applications
  if (isApplication) {
    targets[options.buildTargetName] = {
      executor: `${NX_PLUGIN_NAME}:build`,
      cache: true,
      inputs: GO_PROJECT_INPUTS,
      outputs: ['{workspaceRoot}/dist/{projectRoot}*'],
      metadata: {
        technologies: ['go'],
        description: 'Builds the Go application',
        help: {
          command: 'go help build',
          example: { options: { main: 'main.go' } },
        },
      },
    };
    targets[options.serveTargetName] = {
      executor: `${NX_PLUGIN_NAME}:serve`,
      continuous: true,
      metadata: {
        technologies: ['go'],
        description: 'Runs the Go application',
        help: {
          command: 'go help run',
          example: { options: { main: 'main.go' } },
        },
      },
    };

    // Air serve target - only if config exists and executable is available
    if (hasAirSetup) {
      targets[options.serveAirTargetName] = {
        executor: `${NX_PLUGIN_NAME}:serve-air`,
        continuous: true,
        metadata: {
          technologies: ['go'],
          description: 'Runs the Go application with Air live reload',
          help: {
            command: 'air -h',
            example: { options: { config: '.air.toml' } },
          },
        },
      };
    }
  }

  // Test, Lint, and Tidy targets - for all Go projects
  targets[options.testTargetName] = {
    executor: `${NX_PLUGIN_NAME}:test`,
    cache: true,
    inputs: GO_PROJECT_INPUTS,
    // Note: test target intentionally has no outputs as test execution doesn't produce cacheable artifacts
    metadata: {
      technologies: ['go'],
      description: 'Tests the Go project',
      help: {
        command: 'go help test',
        example: { options: { cover: true } },
      },
    },
  };

  targets[options.lintTargetName] = {
    executor: `${NX_PLUGIN_NAME}:lint`,
    cache: true,
    inputs: GO_PROJECT_INPUTS,
    metadata: {
      technologies: ['go'],
      description: 'Lints the Go project',
      help: {
        command: 'go help fmt',
        example: {},
      },
    },
  };

  targets[options.tidyTargetName] = {
    executor: `${NX_PLUGIN_NAME}:tidy`,
    cache: true,
    inputs: GO_PROJECT_INPUTS,
    outputs: [`{projectRoot}/${GO_MOD_FILE}`, '{projectRoot}/go.sum'],
    metadata: {
      technologies: ['go'],
      description: 'Tidies the Go project dependencies',
      help: {
        command: 'go help mod',
        example: {},
      },
    },
  };

  targets[options.generateTargetName] = {
    executor: `${NX_PLUGIN_NAME}:generate`,
    cache: true,
    inputs: GO_PROJECT_INPUTS,
    metadata: {
      technologies: ['go'],
      description: 'Generates Go source code files',
      help: {
        command: 'go help generate',
        example: { options: { args: ['./...'] } },
      },
    },
  };

  return targets;
};
