import { describe, expect, it, vi } from 'vitest';
import { fetchImageFromUrl } from './fetch-image-from-url';

describe('fetchImageFromUrl', () => {
  it('retourne null pour une URL invalide', async () => {
    await expect(fetchImageFromUrl('ftp://x')).resolves.toBeNull();
    await expect(fetchImageFromUrl('')).resolves.toBeNull();
  });

  it('télécharge une image HTTP', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'image/jpeg' },
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      }),
    );

    const file = await fetchImageFromUrl('https://example.com/a.jpg');
    expect(file?.buffer.length).toBe(3);
    expect(file?.mimetype).toBe('image/jpeg');

    vi.unstubAllGlobals();
  });
});
