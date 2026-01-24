import { ExecutorContext } from '@nx/devkit';
import { readNxJson } from 'nx/src/config/nx-json';
import * as sharedFunctions from '../../utils';
import executor from './executor';
import { TidyExecutorSchema } from './schema';

jest.mock('../../utils', () => ({
  executeCommand: jest.fn().mockResolvedValue({ success: true }),
  extractProjectRoot: jest.fn(() => 'apps/project'),
}));

const options: TidyExecutorSchema = {};

const context: ExecutorContext = {
  cwd: 'current-dir',
  root: '',
  isVerbose: false,
  projectsConfigurations: undefined,
  nxJsonConfiguration: undefined,
  projectGraph: undefined,
};

describe('Tidy Executor', () => {
  it('should execute tidy command with default options', async () => {
    const output = await executor(options, context);
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['mod', 'tidy'],
      { cwd: 'apps/project' }
    );
  });

  it('should execute tidy command with custom options', async () => {
    const output = await executor({ ...options, args: ['-v'] }, context);
    expect(output.success).toBeTruthy();
    expect(sharedFunctions.executeCommand).toHaveBeenCalledWith(
      ['mod', 'tidy', '-v'],
      { cwd: 'apps/project' }
    );
  });
});
