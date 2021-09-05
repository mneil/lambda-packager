#!/usr/bin/env node
import { main } from '../lib';

main({
  packageDir: 'lib',
  installDir: '.',
}).then(console.log);
