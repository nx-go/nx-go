/* eslint-disable @typescript-eslint/no-explicit-any */

import executor from './executor'
import { LintExecutorSchema } from './schema'

import * as child_process from 'child_process'
import { ExecSyncOptionsWithBufferEncoding } from 'child_process'

const options: LintExecutorSchema = {}

const sampleContext = {
  root: '',
  cwd: '',
  isVerbose: true,
  projectName: 'test-project',
  workspace: {
    version: 1,
    npmScope: 'test-workspace',
    projects: {
      'test-project': {
        root: 'libs/test-project',
      },
    },
  },
}

describe('Lint Executor', () => {
  afterEach(() => jest.clearAllMocks())

  it('can run', async () => {
    ;(child_process as any).execSync = jest.fn().mockReturnValue({
      success: true,
    })
    const output = await executor(options, sampleContext)
    expect(output.success).toBe(true)
  })

  it('properly formats command when all options provided', async () => {
    ;(child_process as any).execSync = jest.fn((command: string, opts: ExecSyncOptionsWithBufferEncoding) => {
      expect(command).toBe('revive -config revive.toml -exclude node_modules/... ./...')
      expect(opts.cwd).toBe('libs/test-project')
      return { success: true }
    })

    const output = await executor(
      {
        linter: 'revive',
        args: '-config revive.toml -exclude node_modules/...',
      },
      sampleContext,
    )
    expect(output.success).toBe(true)
  })

  it('properly formats command with no options', async () => {
    ;(child_process as any).execSync = jest.fn((command: string, opts: ExecSyncOptionsWithBufferEncoding) => {
      expect(command).toBe('go fmt ./...')
      expect(opts.cwd).toBe('libs/test-project')
      return { success: true }
    })

    const output = await executor(options, sampleContext)
    expect(output.success).toBe(true)
  })

  it('properly formats command with arguments only', async () => {
    ;(child_process as any).execSync = jest.fn((command: string, opts: ExecSyncOptionsWithBufferEncoding) => {
      expect(command).toBe('go fmt -x ./...')
      expect(opts.cwd).toBe('libs/test-project')
      return { success: true }
    })

    const output = await executor({ args: '-x' }, sampleContext)
    expect(output.success).toBe(true)
  })

  it('properly formats command with linter only', async () => {
    ;(child_process as any).execSync = jest.fn((command: string, opts: ExecSyncOptionsWithBufferEncoding) => {
      expect(command).toBe('revive ./...')
      expect(opts.cwd).toBe('libs/test-project')
      return { success: true }
    })

    const output = await executor({ linter: 'revive' }, sampleContext)
    expect(output.success).toBe(true)
  })
})
