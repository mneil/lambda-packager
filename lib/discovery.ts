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
 * Given a manifest type and arguments create a new
 * instance of IManifest type and return it.
 * @param type
 * @param args
 */
function manifestFactory<T extends manifest.IManifest>(
  type: {
    new (...args: any[]): T;
  },
  ...args: any[]
): T {
  return new type(...args);
}
/**
 * Given a filepath we attempt to create a manifest
 * by detecting the type and returning it correctly
 * instantiated from the filepath
 *
 * @param filePath
 */
export function fromManifestFile(filePath: string) {
  let abspath = filePath;
  if (!path.isAbsolute(filePath)) {
    abspath = path.resolve(filePath);
  }
  const basename = path.basename(abspath);
  const manifest = manifestTypes.get(basename);
  if (manifest) {
    return manifestFactory(manifest as any, basename, path.dirname(abspath));
  }
  throw new Error(`Cannot create manifest from path ${abspath}`);
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
      return fromManifestFile(p);
    }
  }
  throw new Error('Unable to determine package type. Did not find one of');
}
/**
 * A map of manifest types. Each key refers to a manifest name
 * we might expect to find and the value is a manifest type
 * to instantiate that controls common functions for the type.
 */
const manifestTypes = new Map<string, manifest.IManifest>([
  ['package.json', manifest.NodeManifest as any],
  ['requirements.txt', manifest.PythonManifest as any],
]);
