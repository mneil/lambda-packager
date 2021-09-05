import { debug } from '../debug';
import { copy } from '../fs';
import { spawn } from 'child_process';
import * as path from 'path';

/**
 * IManifest representation. A manifest defines what type
 * of project this is and how to handle building it.
 */
export interface IManifest {
  readonly manifest: string;
  install(dir: string): Promise<void>;
}

/**
 * BaseManifest implements common tasks that IManifests
 * need to perform.
 */
export abstract class BaseManifest implements IManifest {
  readonly manifest: string;
  protected readonly _baseDir: string;
  constructor(manifestFile: string, baseDir: string) {
    this.manifest = manifestFile;
    this._baseDir = baseDir;
  }
  /**
   * Execute arbitrary commands. Meant to be used by class
   * extensions to run install scripts
   * @param cmd
   * @param args
   * @param options
   */
  protected async exec(
    cmd: string,
    args?: Array<string>,
    options: any = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      debug('executing %s %s', cmd, args?.join(' '));
      const spawned = spawn(cmd, args, {
        // accept all options without question
        ...options,
        // overload options.env to merge in existing environment plus whatever user passes
        // so that they can set variables and pass them in. #elitedangerous
        ...(!options.env ? {} : Object.assign({}, process.env, options.env)),
      });
      spawned.stdout.on('data', (data) => debug(data.toString('utf8')));
      spawned.stderr.on('data', (data) => debug(data.toString('utf8')));
      spawned.on('error', reject);
      spawned.on('close', (code) => {
        if (code == 0) {
          return resolve();
        }
        return reject(new String(code));
      });
    });
  }
  /**
   * Copy manifest file to the directory
   * Useful if you need to copy the manifest
   * to the destination
   *
   * @param dir
   */
  protected async copyManifest(dir: string) {
    const packageFile = path.resolve(this._baseDir, this.manifest);
    await copy(packageFile, path.join(dir, path.basename(packageFile)));
  }
  /**
   * Install dependencies
   */
  async install(dir: string): Promise<void> {
    throw new Error('not implemented');
  }
}
