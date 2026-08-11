import { describe, expect, it, vi, afterEach } from 'vitest';
import { transformMediaUrls } from './absolute-media-url.interceptor';

describe('transformMediaUrls', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('préfixe récursivement tous les chemins uploads/', () => {
    vi.stubEnv('API_PUBLIC_URL', 'https://api.example.com');

    const input = {
      images: ['uploads/1/room/2/a.jpg'],
      image: 'uploads/1/property/b.jpg',
      avatar: 'uploads/users/3/avatar/c.jpg',
      nested: { imageUrl: 'uploads/4/room/5/d.jpg' },
      name: 'Suite',
      price: 120,
    };

    expect(transformMediaUrls(input)).toEqual({
      images: ['https://api.example.com/uploads/1/room/2/a.jpg'],
      image: 'https://api.example.com/uploads/1/property/b.jpg',
      avatar: 'https://api.example.com/uploads/users/3/avatar/c.jpg',
      nested: {
        imageUrl: 'https://api.example.com/uploads/4/room/5/d.jpg',
      },
      name: 'Suite',
      price: 120,
    });
  });
});
