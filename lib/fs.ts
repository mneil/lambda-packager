/**
 * Common file system operations that packaging needs
 * to perform
 */
import { log } from './debug';
import archiver from 'archiver';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

const debug = log();

/**
 * Try to create a temporary directory to work in
 *
 * @throws {NodeJS.ErrnoException}
 */
export async function createTempDir(): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.mkdtemp(`${os.tmpdir()}${path.sep}`, (err, directory) => {
      if (err) return reject(err);
      return resolve(directory);
    });
  });
}
/**
 * Copy a source directory to a target directory
 * @param src source directory
 * @param target target directory
 */
export async function copy(src: string, target: string): Promise<void> {
  return fsExtra.copy(src, target);
}

/**
 * archive compresses a folder into a .zip archive
 * to destination
 * @param src The source folder to compress
 * @param destination Output file of the compressed archive
 */
export async function archive(
  src: string,
  destination: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destination);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    output.on('close', function () {
      debug(archive.pointer() + ' total bytes');
      debug(
        'archiver has been finalized and the output file descriptor has closed.'
      );
      resolve(true);
    });
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        debug('file not found while archiving', err);
      } else {
        // throw error
        reject(err);
      }
    });
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(src, false);
    archive.finalize();
  });
}
