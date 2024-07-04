import {
  formatFiles,
  getProjects,
  type ProjectConfiguration,
  type TargetConfiguration,
  type Tree,
  updateProjectConfiguration,
} from '@nx/devkit';

const generateCommand = 'go generate';

/**
 * Use nx-go generate executor in projects using a
 * "run-commands" target for generating code.
 *
 * @note This migration only supports the most basic use case.
 * @param tree the project tree
 */
export default async function update(tree: Tree) {
  const projects = getProjects(tree);

  for (const [projectName, projectConfig] of projects) {
    if (!projectConfig.targets) continue;

    const goGenerateTarget = getGoGenerateTarget(projectConfig);

    if (goGenerateTarget != null) {
      const command = goGenerateTarget[1].options?.command;
      const args: string = command?.replace(generateCommand, '').trim() ?? '';

      projectConfig.targets[goGenerateTarget[0]] = {
        executor: '@nx-go/nx-go:generate',
        options: args.length > 0 ? { args: args.split(' ') } : undefined,
      };

      updateProjectConfiguration(tree, projectName, projectConfig);
    }
  }

  await formatFiles(tree);
}

const getGoGenerateTarget = (
  projectConfig: ProjectConfiguration
): [string, TargetConfiguration] | null =>
  // do not detect shorthand target because the command needs to be executed in the project directory
  Object.entries(projectConfig.targets).find(
    ([, target]) =>
      target.executor === 'nx:run-commands' &&
      target.options != null &&
      Object.keys(target.options).length === 2 &&
      target.options.command?.startsWith(generateCommand) &&
      (target.options.cwd === projectConfig.root ||
        target.options.cwd === '{projectRoot}')
  );
