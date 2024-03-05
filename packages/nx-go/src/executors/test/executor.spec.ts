import { TestExecutorSchema } from './schema'
import executor from './executor'

jest.mock('../../utils')
import * as utils from '../../utils'

const options: TestExecutorSchema = {}

describe('Test Executor', () => {
  beforeEach(async () => {
    // Mocks the runGoCommand
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(utils as any).runGoCommand = jest.fn().mockReturnValue({
      success: true,
    })
  })

  afterEach(() => jest.clearAllMocks())

  it('can run', async () => {
    const output = await executor(options, null)
    expect(output.success).toBe(true)
  })

  it('can run when given packages', async () => {
    const localOptions = { ...options, packages: ['./apps/messaging/...', './apps/omega/star/...'] }
    const output = await executor(localOptions, null)
    expect(output.success).toBe(true)
  })

  it('can run when given build tags', async () => {
    const localOptions = { ...options, tags: ['integration'] }
    const output = await executor(localOptions, null)
    expect(output.success).toBe(true)
  })
})
