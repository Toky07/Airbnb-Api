import { mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

const testUploadRoot = join(tmpdir(), `airbnb-api-uploads-${randomUUID()}`);
mkdirSync(testUploadRoot, { recursive: true });
process.env.UPLOAD_ROOT = testUploadRoot;
process.env.THROTTLE_ENABLED = process.env.THROTTLE_ENABLED ?? 'false';
process.env.SKIP_ENV_VALIDATION = process.env.SKIP_ENV_VALIDATION ?? 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? '1234';
