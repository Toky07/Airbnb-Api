import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { randomUUID } from 'crypto';
import type { UploadFile } from '@src/modules/media/types/upload-file';
import {
  buildUploadRelativePath,
  toDiskPath,
  type SaveMediaContext,
} from '@src/modules/media/utils/build-upload-path';
import {
  detectImageKind,
  extensionForImageKind,
} from '@src/modules/media/utils/detect-image-kind';
import { resolveUploadRoot } from '@src/modules/media/utils/resolve-upload-root';

export const LOCAL_STORAGE_SERVICE = 'LOCAL_STORAGE_SERVICE';

export interface ILocalStorageService {
  save(file: UploadFile, context: SaveMediaContext): Promise<string>;
  delete(relativePath: string): Promise<void>;
  deleteMany(relativePaths: string[]): Promise<void>;
}

@Injectable()
export class LocalStorageService implements ILocalStorageService {
  async save(file: UploadFile, context: SaveMediaContext): Promise<string> {
    const kind = detectImageKind(file.buffer);
    if (!kind) {
      throw new BadRequestException(
        'Seules les images JPEG, PNG ou WebP sont acceptées.',
      );
    }

    const extension = extensionForImageKind(kind);
    const filename = `${randomUUID()}${extension}`;
    const relativePath = buildUploadRelativePath(context, filename);
    const absolutePath = toDiskPath(relativePath, resolveUploadRoot());

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.buffer);

    return relativePath;
  }

  async delete(relativePath: string): Promise<void> {
    const absolutePath = toDiskPath(relativePath, resolveUploadRoot());
    try {
      await unlink(absolutePath);
    } catch {
      // file may already be removed
    }
  }

  async deleteMany(relativePaths: string[]): Promise<void> {
    await Promise.all(relativePaths.map((path) => this.delete(path)));
  }
}
