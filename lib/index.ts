import { log } from './debug';
import { discover, fromManifestFile } from './discovery';
import { createTempDir, copy, archive } from './fs';
import { IManifest } from './manifest';
import { version } from './version';
import { debug as nodeDebug } from 'debug';
import * as path from 'path';

const debug = log();
/**
 * Base options type
 */
interface IOptions {
  debug: boolean;
  baseDir: string;
  packageDir: string;
  installDir: string;
  manifest: IManifest | string;
  output: string;
  upload: boolean;
}
/**
 * User (cli) provided options
 */
export interface IUserOptions extends IOptions {
  manifest: string;
}
/**
 * Options required for the application to function
 */
export interface IApplicationOptions extends IOptions {
  manifest: IManifest;
}

/**
 * Given a partial set of {IOptions} return a full set of IApplicationOptions
 * completely filled
 *
 * @param options
 */
export async function getOptionsWithDefaults(options: Partial<IOptions> = {}) {
  const defaults = {
    debug: false,
    baseDir: process.cwd(),
    packageDir: 'lambda',
    installDir: 'src',
    manifest: '',
    output: 'dist.zip',
    upload: false,
  };
  // merge user options with defaults
  const settings = Object.assign({}, defaults, options) as IOptions;
  // create an instance of IManifest
  if (settings.manifest !== '') {
    settings.manifest = fromManifestFile(settings.manifest as string);
  } else {
    settings.manifest = await discover(settings.baseDir);
  }
  return settings as Required<IApplicationOptions>;
}

/**
 * Application entrypoint. Pass it options and let it
 * try to package your lambda
 * @param options
 */
export async function main(options: Partial<IOptions> = {}) {
  const settings = await getOptionsWithDefaults(options);
  if (settings.debug) {
    nodeDebug.enable('lp*');
  }
  debug('provided options %o', options);
  debug('configured options %o', settings);
  // warn users if install starts with package dir. It may be intentional
  // like a folder structure lambda/lambda/src where package is lambda and
  // install is lambda/src
  if (settings.installDir.startsWith(settings.packageDir)) {
    debug(
      `Installation directory contains package directory.
Installation directory should be relative to the package directory.`
    );
  }
  debug('using manifest %s', settings.manifest.manifest);
  // create a temporary directory
  const tempDir = await createTempDir();
  // copy the lambda source to temp directory
  const packageDir = path.resolve(settings.baseDir, settings.packageDir);
  debug('copying %s to %s', packageDir, tempDir);
  await copy(packageDir, tempDir);
  // calculate the version based on the source files
  const calculatedVersion = await version(tempDir);
  // install manifest dependencies into temporary directory
  const installDir = path.resolve(tempDir, settings.installDir);
  debug('installing dependencies to %s', installDir);
  await settings.manifest.install(installDir);
  // archive the temporary directory
  debug('archiving to %s', settings.output);
  await archive(tempDir, settings.output);
  debug('calculated version %s', calculatedVersion);
  return Promise.resolve(calculatedVersion);
}
