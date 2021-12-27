import executor from './executor'
import { LintExecutorSchema } from './schema'

const options: LintExecutorSchema = {}

describe('Lint Executor', () => {
  it('can run', async () => {
    const output = await executor(options, null)
    expect(output.success).toBe(true)
  })
})
