import { describe, expect, it } from 'vitest';
import { isPublicUploadPath } from './is-public-upload-path';

describe('isPublicUploadPath', () => {
  it('allows public image media', () => {
    expect(isPublicUploadPath('/uploads/3/room/5/abc.jpg')).toBe(true);
    expect(isPublicUploadPath('uploads/users/7/avatar/x.webp')).toBe(true);
    expect(isPublicUploadPath('42/property/photo.png')).toBe(true);
  });

  it('blocks invoices, emails, traversal and non-images', () => {
    expect(
      isPublicUploadPath('/uploads/invoices/facture-FACT-2026-000001.pdf'),
    ).toBe(false);
    expect(isPublicUploadPath('uploads/emails/12/secret.pdf')).toBe(false);
    expect(isPublicUploadPath('uploads/3/room/5/../../invoices/x.pdf')).toBe(
      false,
    );
    expect(isPublicUploadPath('uploads/3/room/5/note.html')).toBe(false);
    expect(isPublicUploadPath('uploads/3/room/5/icon.svg')).toBe(false);
  });
});
