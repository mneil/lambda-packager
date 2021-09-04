import { BaseManifest } from './base';

/**
 * NodeManifest contains logic specific to packaging
 * node.js projects that contain package.json type manifests.
 */
export class NodeManifest extends BaseManifest {
  async install(dir: string): Promise<void> {}
}
