import { BuildExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
  console.log('Executor ran for Build', options, context);
  return {
    success: true,
  };
}
