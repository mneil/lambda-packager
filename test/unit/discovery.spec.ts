import { discover } from '../../lib/discovery';
import { assert } from 'chai';
import * as path from 'path';

describe('Discover', function () {
  it('should detect this is a nodejs project', async () => {
    const packagePath = path.resolve(__dirname, '../../');
    const manifest = await discover(packagePath);
    assert.equal(manifest.manifest, 'package.json');
  });
  it('should detect python fixture', async () => {
    const packagePath = path.resolve(
      __dirname,
      '../',
      'fixtures/python/requirements'
    );
    const manifest = await discover(packagePath);
    assert.equal(manifest.manifest, 'requirements.txt');
  });
});
