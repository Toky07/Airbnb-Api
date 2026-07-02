import { mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

const testUploadRoot = join(tmpdir(), `airbnb-api-uploads-${randomUUID()}`);
mkdirSync(testUploadRoot, { recursive: true });
process.env.UPLOAD_ROOT = testUploadRoot;
