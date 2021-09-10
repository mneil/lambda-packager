import { log } from './debug';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const debug = log();
/**
 * Upload a file to S3
 *
 * @param from
 * @param bucket
 * @param key
 */
export function upload(
  from: string,
  bucket: string,
  key: string,
  fingerprint?: string
): Promise<PutObjectCommandOutput> {
  //usage
  const s3 = new S3Client({});
  return s3.send(
    new PutObjectCommand({
      Body: fs.createReadStream(path.resolve(from), 'utf8'),
      Bucket: bucket,
      Key: key,
      Metadata: {
        ...(fingerprint ? { fingerprint } : {}),
        application: '@mneil/lambda-packager',
      },
    })
  );
}
