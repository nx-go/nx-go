/**
 * This script starts a local registry for e2e testing purposes.
 * It is meant to be called in jest's globalSetup.
 */
import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { execSync } from 'child_process';

export default async () => {
  // local registry target to run
  const localRegistryTarget = '@nx-go/source:local-registry';
  // storage folder for the local registry
  const storage = './tmp/local-registry/storage';

  global.stopLocalRegistry = await startLocalRegistry({
    localRegistryTarget,
    storage,
    verbose: false,
  });
  execSync(
    'npx nx run-many --targets publish-local --ver 0.0.0-e2e --tag latest',
    { env: process.env, stdio: 'inherit' }
  );
};
