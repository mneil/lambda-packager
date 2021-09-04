import * as os from 'os';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as archiver from 'archiver';
export { version } from './version';
export { discover } from './discovery';
export { PythonManifest, NodeManifest } from './manifest';

/**
 * Common lambda packaging things.
 *
 * 1. What type of project is it? Python, node, go, java, etc...?
 * 2. Where are the dependencies declared? Usually easy except python makes it... not easy. Go, is there a mod file or not?
 * 3. Create a temporary directory to work in
 * 4. Copy source files to that directory
 * 5. Install dependencies into that directory
 * 6. Archive the directory
 * 7. Upload that archive to S3 and give it a distinct name
 * 8. Inject that name somewhere? That's up to the user. We'll simply output the distinct name to be used....
 */

export async function createTemp(): Promise<string | NodeJS.ErrnoException> {
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
export async function copy(src, target): Promise<boolean> {
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

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
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

    // append files from a sub-directory and naming it `new-subdir` within the archive
    archive.directory(src);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory('subdir/', false);

    archive.finalize();
  });
}
