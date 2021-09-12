/**
 * Borrowed straight from AWS CDK https://github.com/aws/aws-cdk
 * Original file https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/core/lib/fs
 * from commit 01bf6e2922994e7d41c8c6b171aa1693835f2b53
 *
 * Apache 2.0 license
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { copyDirectory } from "./copy";
import { fingerprint } from "./fingerprint";
import { CopyOptions, FingerprintOptions } from "./options";

export * from "./ignore";
export * from "./options";
export { fingerprint };

/**
 * File system utilities.
 */
export class FileSystem {
  /**
   * Copies an entire directory structure.
   * @param srcDir Source directory
   * @param destDir Destination directory
   * @param options options
   * @param rootDir Root directory to calculate exclusions from
   */
  public static copyDirectory(
    srcDir: string,
    destDir: string,
    options: CopyOptions = {},
    rootDir?: string
  ) {
    return copyDirectory(srcDir, destDir, options, rootDir);
  }

  /**
   * Produces fingerprint based on the contents of a single file or an entire directory tree.
   *
   * The fingerprint will also include:
   * 1. An extra string if defined in `options.extra`.
   * 2. The set of exclude patterns, if defined in `options.exclude`
   * 3. The symlink follow mode value.
   *
   * @param fileOrDirectory The directory or file to fingerprint
   * @param options Fingerprinting options
   */
  public static fingerprint(
    fileOrDirectory: string,
    options: FingerprintOptions = {}
  ) {
    return fingerprint(fileOrDirectory, options);
  }

  /**
   * Checks whether a directory is empty
   *
   * @param dir The directory to check
   */
  public static isEmpty(dir: string): boolean {
    return fs.readdirSync(dir).length === 0;
  }

  /**
   * The real path of the system temp directory
   */
  public static get tmpdir(): string {
    if (FileSystem._tmpdir) {
      return FileSystem._tmpdir;
    }
    FileSystem._tmpdir = fs.realpathSync(os.tmpdir());
    return FileSystem._tmpdir;
  }

  /**
   * Creates a unique temporary directory in the **system temp directory**.
   *
   * @param prefix A prefix for the directory name. Six random characters
   * will be generated and appended behind this prefix.
   */
  public static mkdtemp(prefix: string): string {
    return fs.mkdtempSync(path.join(FileSystem.tmpdir, prefix));
  }

  private static _tmpdir?: string;
}
