import { fingerprint } from './fingerprint';

export async function version(package_directory: string = '') {
  if (package_directory == '') {
    package_directory = process.cwd();
  }
  // cdk fingerprint(directory)
  const sha = fingerprint(package_directory);
  // TODO: get git sha

  return sha.substring(0, 8);
}
