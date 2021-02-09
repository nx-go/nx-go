import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '@angular-devkit/schematics/testing'
import { createEmptyWorkspace } from '@nrwl/workspace/testing'
import { join } from 'path'

import { LibrarySchematicSchema } from './schema'

describe('library schematic', () => {
  let appTree: Tree
  const options: LibrarySchematicSchema = { name: 'test' }

  const testRunner = new SchematicTestRunner('@nx-go/nx-go', join(__dirname, '../../../collection.json'))

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty())
  })

  it('should run successfully', async () => {
    await expect(testRunner.runSchematicAsync('library', options, appTree).toPromise()).resolves.not.toThrowError()
  })
})
