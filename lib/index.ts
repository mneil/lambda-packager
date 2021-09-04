import { discover } from './discovery';
import { createTempDir, copy, archive } from './fs';
import { IManifest } from './manifest';
import { version } from './version';
import * as path from 'path';

export { PythonManifest, NodeManifest, IManifest } from './manifest';

export interface IOptions {
  baseDir: string;
  packageDir: string;
  installDir: string;
  manifest: IManifest;
  output: string;
  upload: boolean;
}
/**
 * Application entrypoint. Pass it options and let it
 * try to package your lambda
 * @param options
 */
export async function main(options: Partial<IOptions> = {}) {
  const defaults = {
    baseDir: process.cwd(),
    packageDir: 'lambda',
    installDir: 'src',
    manifest: null,
    output: 'dist.zip',
    upload: false,
  };
  // merge user options with defaults
  const settings = Object.assign({}, defaults, options) as IOptions;
  // warn users if install starts with package dir. It may be intentional
  // like a folder structure lambda/lambda/src where package is lambda and
  // install is lambda/src
  if (settings.installDir.startsWith(settings.packageDir)) {
    console.warn(
      `Installation directory contains package directory.
Installation directory should be relative to the package directory.`
    );
  }
  // get the manifest
  const manifest = options.manifest || (await discover(settings.baseDir));
  // create a temporary directory
  const tempDir = await createTempDir();
  // copy the lambda source to temp directory
  await copy(path.resolve(settings.baseDir, settings.packageDir), tempDir);
  // install manifest dependencies into temporary directory
  await manifest.install(path.resolve(tempDir, settings.installDir));
  // archive the temporary directory
  await archive(tempDir, settings.output);
  const calculatedVersion = await version(tempDir);
  return Promise.resolve(calculatedVersion);
}
