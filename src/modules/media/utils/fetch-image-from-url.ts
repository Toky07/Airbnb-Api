import type { UploadFile } from '../types/upload-file';
import { bufferToUploadFile } from './buffer-to-upload-file';

const FETCH_TIMEOUT_MS = 12_000;

export async function fetchImageFromUrl(url: string): Promise<UploadFile | null> {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null;
  }

  try {
    const response = await fetch(trimmed, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) {
      return null;
    }

    const contentType =
      response.headers.get('content-type')?.split(';')[0]?.trim() ??
      'image/jpeg';

    const extension = extensionFromContentType(contentType, trimmed);

    return bufferToUploadFile(buffer, {
      fieldname: 'images',
      originalname: `import${extension}`,
      mimetype: contentType,
    });
  } catch {
    return null;
  }
}

function extensionFromContentType(contentType: string, url: string): string {
  if (contentType.includes('png')) {
    return '.png';
  }
  if (contentType.includes('webp')) {
    return '.webp';
  }
  if (contentType.includes('gif')) {
    return '.gif';
  }
  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    return '.jpg';
  }

  const fromUrl = url.match(/\.(jpe?g|png|webp|gif)(\?|$)/i);
  if (fromUrl) {
    return `.${fromUrl[1]!.toLowerCase().replace('jpeg', 'jpg')}`;
  }

  return '.jpg';
}
