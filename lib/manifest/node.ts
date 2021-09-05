import { debug } from '../debug';
import { copy } from '../fs';
import { BaseManifest } from './base';
import * as path from 'path';

/**
 * NodeManifest contains logic specific to packaging
 * node.js projects that contain package.json type manifests.
 */
export class NodeManifest extends BaseManifest {
  /**
   * Whether or not to npm ci. If false install will run `npm i`
   */
  protected ci = true;
  /**
   * Try to copy npm-shrinkwrap.json or package-lock.json files to destination
   * so that we can run npm ci
   * @param dir
   */
  protected async copyPackageLock(dir: string) {
    const shrinkwrap = path.join(this._baseDir, 'npm-shrinkwrap.json');
    try {
      await copy(shrinkwrap, path.join(dir, path.basename(shrinkwrap)));
    } catch (err) {
      debug('no shrinkwrap file found %s', shrinkwrap);
      const lock = path.join(this._baseDir, 'package-lock.json');
      try {
        await copy(lock, path.join(dir, path.basename(lock)));
      } catch (err) {
        debug('no lock file found %s', lock);
        this.ci = false;
      }
    }
  }

  async install(dir: string): Promise<void> {
    await this.copyManifest(dir);
    await this.copyPackageLock(dir);

    const installCommand = this.ci ? 'ci' : 'i';

    return await this.exec('npm', [
      installCommand,
      '--production',
      '--prefix',
      dir,
    ]);
  }
}
