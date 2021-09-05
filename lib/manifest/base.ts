import { debug } from '../debug';
import { spawn } from 'child_process';

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
  private readonly _baseDir: string;
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
    args: Array<string>,
    options: any
  ): Promise<string | void> {
    return new Promise((resolve, reject) => {
      const spawned = spawn(cmd, args, {
        // accept all options without question
        ...options,
        // overload options.env to merge in existing environment plus whatever user passes
        // so that they can set variables and pass them in. #elitedangerous
        ...(!options.env ? {} : Object.assign({}, process.env, options.env)),
      });
      spawned.stdout.on('data', debug);
      spawned.stderr.on('data', debug);
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
   * Install dependencies
   */
  async install(dir: string): Promise<void> {
    throw new Error('not implemented');
  }
}
