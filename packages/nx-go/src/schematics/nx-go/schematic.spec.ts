import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { NxGoSchematicSchema } from './schema';

describe('nx-go schematic', () => {
  let appTree: Tree;
  const options: NxGoSchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@nx-go/nx-go',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner.runSchematicAsync('nx-go', options, appTree).toPromise()
    ).resolves.not.toThrowError();
  });
});
