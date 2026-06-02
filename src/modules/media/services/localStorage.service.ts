import { Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import type { EntityType } from '../constant';
import { UPLOAD_DIRS, UPLOAD_ROOT } from '../constant';
import type { UploadFile } from '../types/upload-file';

export const LOCAL_STORAGE_SERVICE = 'LOCAL_STORAGE_SERVICE';

export interface ILocalStorageService {
  save(
    file: UploadFile,
    entityType: EntityType,
    entityId: number,
  ): Promise<string>;
  delete(relativePath: string): Promise<void>;
  deleteMany(relativePaths: string[]): Promise<void>;
}

@Injectable()
export class LocalStorageService implements ILocalStorageService {
  async save(
    file: UploadFile,
    entityType: EntityType,
    entityId: number,
  ): Promise<string> {
    const extension = this.resolveExtension(file);
    const filename = `${randomUUID()}${extension}`;
    const relativePath = join(
      UPLOAD_ROOT,
      UPLOAD_DIRS[entityType],
      String(entityId),
      filename,
    );
    const absolutePath = join(process.cwd(), relativePath);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.buffer);

    return relativePath;
  }

  async delete(relativePath: string): Promise<void> {
    const absolutePath = join(process.cwd(), relativePath);
    try {
      await unlink(absolutePath);
    } catch {
      // file may already be removed
    }
  }

  async deleteMany(relativePaths: string[]): Promise<void> {
    await Promise.all(relativePaths.map((path) => this.delete(path)));
  }

  private resolveExtension(file: UploadFile): string {
    const fromName = file.originalname.includes('.')
      ? file.originalname.slice(file.originalname.lastIndexOf('.'))
      : '';
    if (fromName) {
      return fromName;
    }
    if (file.mimetype === 'image/png') return '.png';
    if (file.mimetype === 'image/jpeg') return '.jpg';
    if (file.mimetype === 'image/webp') return '.webp';
    if (file.mimetype === 'image/gif') return '.gif';
    return '';
  }
}
