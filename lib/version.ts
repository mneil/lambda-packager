import { log } from './debug';
import { fingerprint } from './fingerprint';
import * as child_process from 'child_process';

const debug = log();
/**
 * Execute a command in a subprocess
 *
 * @param command
 */
async function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    child_process.exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
      if (stdout === '') {
        return reject('not a git repository');
      }
      if (stderr) {
        return reject(stderr);
      }
      return resolve(stdout.trimRight());
    });
  });
}
/**
 * Get the last n characters of the last commit
 *
 * @param length
 */
async function getLastCommit(length: number = 8) {
  const command = 'git rev-parse HEAD';
  try {
    const sha = await executeCommand(command);
    return sha.substr(0 - length);
  } catch (err) {
    debug('unable to get git sha');
    debug(err);
  }
  return '0000000000000000000000000000000000000000'.slice(0 - length);
}

export async function version(package_directory: string = '') {
  if (package_directory == '') {
    package_directory = process.cwd();
  }
  const id = fingerprint(package_directory);
  const sha = await getLastCommit();

  return `${sha}-${id.substring(0, 8)}`;
}
