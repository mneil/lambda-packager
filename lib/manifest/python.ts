import { BaseManifest } from './base';
import * as path from 'path';

export class PythonManifest extends BaseManifest {
  /**
   * Install manifest file from requirements.txt
   * @param dir
   */
  protected async pipInstallRequirements(dir: string): Promise<void> {
    await this.exec('python', [
      '-m',
      'pip',
      'install',
      '-r',
      path.resolve(this._baseDir, this.manifest),
      '-t',
      `${dir}/`,
    ]);
  }
  async install(dir: string): Promise<void> {
    return await this.pipInstallRequirements(dir);
  }
}
