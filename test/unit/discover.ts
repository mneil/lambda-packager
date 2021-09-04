import { assert } from 'chai';
import * as path from 'path';
import { discover } from '../../lib/discovery';

describe('Discover', function () {
  it('should detect this is a nodejs project', async () => {
    const manifest = await discover(path.resolve(__dirname, '../../'));
    assert.equal(manifest.manifest, 'package.json');
  });
});
