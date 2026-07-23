import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveMediaPublicUrl } from './resolve-media-public-url';

describe('resolveMediaPublicUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('préfixe les chemins uploads/ avec API_PUBLIC_URL', () => {
    vi.stubEnv('API_PUBLIC_URL', 'http://localhost:3000');

    expect(resolveMediaPublicUrl('uploads/16/room/191/photo.jpg')).toBe(
      'http://localhost:3000/uploads/16/room/191/photo.jpg',
    );
  });

  it('conserve les URLs déjà absolues et les non-uploads', () => {
    vi.stubEnv('API_PUBLIC_URL', 'http://localhost:3000');

    expect(resolveMediaPublicUrl('https://cdn.test/a.jpg')).toBe(
      'https://cdn.test/a.jpg',
    );
    expect(resolveMediaPublicUrl('avatar.png')).toBe('avatar.png');
    expect(resolveMediaPublicUrl(null)).toBeNull();
  });
});
