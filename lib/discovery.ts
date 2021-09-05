import * as manifest from './manifest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A generator function to walk and list files in a directory.
 * Skips directories containing common folders that should not
 * be traversed like .git and node_modules, .vent, etc...
 * @param dir Directory to walk
 */
export async function* walk(dir: string): AsyncGenerator<string> {
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
 *
 * @throws {Error}
 */
export async function discover(cwd: string = ''): Promise<manifest.IManifest> {
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

const manifestTypes = new Map([
  ['package.json', manifest.NodeManifest],
  ['requirements.txt', manifest.PythonManifest],
]);