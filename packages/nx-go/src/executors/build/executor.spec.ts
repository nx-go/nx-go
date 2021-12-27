import executor from './executor'
import { BuildExecutorSchema } from './schema'

const options: BuildExecutorSchema = { main: '', outputPath: '' }

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options, null)
    expect(output.success).toBe(true)
  })
})
