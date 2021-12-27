import { TestExecutorSchema } from './schema'
import executor from './executor'

const options: TestExecutorSchema = {}

describe('Test Executor', () => {
  it('can run', async () => {
    const output = await executor(options, null)
    expect(output.success).toBe(true)
  })
})
