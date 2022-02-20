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
})
