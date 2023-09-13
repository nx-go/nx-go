import executor from './executor'
import { BuildExecutorSchema } from './schema'

jest.mock('../../utils')
import * as utils from '../../utils'
import { RunGoCommand } from '../../utils'

const options: BuildExecutorSchema = {}

describe('Build Executor', () => {
  afterEach(() => jest.clearAllMocks())

  it('can run', async () => {
    const mockCommand: RunGoCommand = (ctx, command, params, options) => {
      expect(command).toBe('build')
      expect(params).toHaveLength(0)
      expect(options).toBeUndefined()

      return { success: true }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(utils as any).runGoCommand = jest.fn().mockImplementation(mockCommand)

    const output = await executor(options, null)
    expect(output.success).toBe(true)
  })

  it('receives environment variables', async () => {
    const mockCommand: RunGoCommand = (ctx, command, params, options) => {
      expect(command).toBe('build')
      expect(options.env).toBeDefined()
      expect(options.env.GOOS).toBeDefined()
      expect(options.env.GOOS).toEqual('windows')

      return { success: true }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(utils as any).runGoCommand = jest.fn().mockImplementation(mockCommand)

    const output = await executor({ env: { GOOS: 'windows' } }, null)
    expect(output.success).toBe(true)
  })

  it('pass flags', async () => {
    const mockCommand: RunGoCommand = (ctx, command, params) => {
      expect(command).toBe('build')
      expect(params).toHaveLength(1)
      expect(params[0]).toBe('-ldflags "-s -w"')

      return { success: true }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(utils as any).runGoCommand = jest.fn().mockImplementation(mockCommand)

    const output = await executor({ flags: ['-ldflags "-s -w"'] }, null)
    expect(output.success).toBe(true)
  })
})
