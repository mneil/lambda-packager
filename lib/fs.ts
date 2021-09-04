/**
 * Common file system operations that packaging needs
 * to perform
 */
import archiver from 'archiver';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as os from 'os';

/**
 * Try to create a temporary directory to work in
 *
 * @throws {NodeJS.ErrnoException}
 */
export async function createTempDir(): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.mkdtemp(os.tmpdir(), (err, directory) => {
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
      console.log(archive.pointer() + ' total bytes');
      console.log(
        'archiver has been finalized and the output file descriptor has closed.'
      );
    });
    output.on('end', resolve);
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.warn('file not found while archiving', err);
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
