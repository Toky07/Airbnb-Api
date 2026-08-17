import { describe, expect, it, vi, afterEach } from 'vitest';
import { fetchImageFromUrl } from './fetch-image-from-url';

vi.mock('node:dns/promises', () => ({
  lookup: vi.fn(async () => [{ address: '93.184.216.34', family: 4 }]),
}));

describe('fetchImageFromUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retourne null pour une URL invalide', async () => {
    await expect(fetchImageFromUrl('ftp://x')).resolves.toBeNull();
    await expect(fetchImageFromUrl('')).resolves.toBeNull();
    await expect(
      fetchImageFromUrl('http://example.com/a.jpg'),
    ).resolves.toBeNull();
  });

  it('refuse les cibles SSRF (localhost, metadata, IP privée)', async () => {
    await expect(
      fetchImageFromUrl('http://127.0.0.1/avatar.jpg'),
    ).resolves.toBeNull();
    await expect(
      fetchImageFromUrl('https://127.0.0.1/avatar.jpg'),
    ).resolves.toBeNull();
    await expect(
      fetchImageFromUrl('https://169.254.169.254/latest/meta-data'),
    ).resolves.toBeNull();
    await expect(
      fetchImageFromUrl('https://192.168.1.10/a.jpg'),
    ).resolves.toBeNull();
  });

  it('télécharge une image HTTPS publique', async () => {
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
  });
});
