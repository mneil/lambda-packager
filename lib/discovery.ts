import * as path from 'path';
import * as fs from 'fs';

/**
 * A generator function to walk and list files in a directory.
 * Skips directories containing common folders that should not
 * be traversed like .git and node_modules, .vent, etc...
 * @param dir Directory to walk
 */
export async function* walk(dir) {
  const excludes = ['node_modules', '.git', '.venv'];
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (excludes.filter((excluded) => entry.indexOf(excluded) != -1).length) {
      continue;
    }
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

/**
 * Try to detect what type of project this is by looking
 * for different manifest files
 */
export async function discover(cwd: string = ''): Promise<IManifest> {
  if (cwd == '') {
    cwd = process.cwd();
  }
  for await (const p of walk(cwd)) {
    const manifest = manifestTypes.get(path.basename(p));
    if (manifest) {
      return new manifest(path.basename(p), cwd);
    }
  }
  throw new Error('Unable to determine package type. Did not find one of');
}

/**
 * IManifest representation. A manifest defines what type
 * of project this is and how to handle building it.
 */
export interface IManifest {
  readonly manifest: string;
  install(): void;
}
/**
 * BaseManifest implements common tasks that IManifests
 * need to perform.
 */
abstract class BaseManifest implements IManifest {
  readonly manifest: string;
  private readonly _baseDir: string;
  constructor(manifestFile: string, baseDir: string) {
    this.manifest = manifestFile;
    this._baseDir = baseDir;
  }
  async install() {
    throw new Error('not implemented');
  }
}
/**
 * NodeManifest contains logic specific to packaging
 * node.js projects that contain package.json type manifests.
 */
export class NodeManifest extends BaseManifest {}

const manifestTypes = new Map([['package.json', NodeManifest]]);
