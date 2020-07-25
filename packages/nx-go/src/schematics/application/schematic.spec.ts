import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { ApplicationSchematicSchema } from './schema';

describe('application schematic', () => {
  let appTree: Tree;
  const options: ApplicationSchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@nx-go/nx-go',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner.runSchematicAsync('application', options, appTree).toPromise()
    ).resolves.not.toThrowError();
  });
});
