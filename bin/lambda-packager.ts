#!/usr/bin/env node
import { main, IUserOptions } from '../lib';
import { version } from '../package.json';
import { Command } from 'commander';

const program = new Command();
program.version(version);

program
  .option(
    '-d, --debug',
    'output extra debugging. Equivilent of setting DEBUG=lp*'
  )
  .option(
    '--base-dir <dir>',
    'root folder to use for manifest discovery. Defaults to cwd',
    process.cwd()
  )
  .option(
    '-p, --package-dir <dir>',
    'source folder of your lambda package',
    'lambda'
  )
  .option(
    '-i, --install-dir <dir>',
    'relative path in package directory to install dependencies',
    'src'
  )
  .option('-m, --manifest <filepath>', 'path to your manifest file')
  .option('-p, --output <dir>', 'name of the archive to create', 'dist.zip')
  .option('-b, --bucket <s3_bucket>', 'upload package to the s3 bucket')
  .option('--prefix <s3_path>', 'a path prefix on s3 to place the archive');

program.parse(process.argv);
const options = program.opts() as IUserOptions;

main(options).then(console.log);
