import { createTempDir, copy, archive } from '../../lib/fs';
import { assert } from 'chai';
import * as fs from 'fs/promises';
import * as path from 'path';

// /**
//  * Copy a source directory to a target directory
//  * @param src source directory
//  * @param target target directory
//  */
// export async function copy(src: string, target: string): Promise<void> {
//   return fsExtra.copy(src, target);
// }

describe('Fs', function () {
  describe('#createTempDir', function () {
    it('should create a new temporary directory', async () => {
      const tmp = await createTempDir();
      assert.isNotEmpty(tmp);
      const dir = await fs.stat(tmp);
      assert.equal(dir.isDirectory(), true);
    });
    it('should create unique directories', async () => {
      const tmp1 = await createTempDir();
      const tmp2 = await createTempDir();
      assert.notEqual(tmp1, tmp2);
    });
  });
  describe('#copy', function () {
    /**
     * We're testing fs-extra here really so this test is for coverage only
     * and is pretty arbitrary. If, in the future, copy does more than
     * call fs-extra then we can expand these tests.
     */
    it('should copy a folder', async () => {
      // create a temp directory to copy the file to
      const tmp = await createTempDir();
      await copy(path.resolve(__dirname, '../fixtures/python'), tmp);
      const requirements = await fs.stat(
        path.resolve(tmp, 'requirements/requirements.txt')
      );
      assert.equal(requirements.isFile(), true);
    });
  });
  describe('#archive', function () {
    it('should compress a directory to a non-zero size', async () => {
      // create a temp directory to store the archive in
      const tmp = await createTempDir();
      const archivePath = path.join(tmp, 'dist.zip');
      await archive(path.resolve(__dirname, '../fixtures/python'), archivePath);

      const archiveDir = await fs.stat(archivePath);
      assert.equal(archiveDir.isFile(), true);
      // make sure the archive has files in it / is not empty
      assert.isTrue(archiveDir.blksize > 2048);
    });
  });
});
