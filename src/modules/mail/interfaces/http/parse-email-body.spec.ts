import { describe, expect, it } from 'vitest';
import { parseEmailBody } from './parse-email-body';

describe('parseEmailBody', () => {
  it('parse les champs texte du formulaire email', () => {
    expect(
      parseEmailBody({
        to: 'client@example.com',
        cc: 'copy@example.com',
        subject: 'Bonjour',
        body: 'Message',
        isHtml: 'true',
        sourceModule: 'dashboard',
      }),
    ).toEqual({
      to: 'client@example.com',
      cc: 'copy@example.com',
      bcc: undefined,
      subject: 'Bonjour',
      body: 'Message',
      isHtml: true,
      sourceModule: 'dashboard',
    });
  });
});
