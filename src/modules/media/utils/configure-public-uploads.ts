import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response, NextFunction } from 'express';
import { extname, join } from 'path';
import { mimeForImageKind } from './detect-image-kind';
import { isPublicUploadPath } from './is-public-upload-path';

function contentTypeForPublicImage(filePath: string): string {
  const extension = extname(filePath).toLowerCase();
  if (extension === '.png') {
    return mimeForImageKind('png');
  }
  if (extension === '.webp') {
    return mimeForImageKind('webp');
  }
  return mimeForImageKind('jpeg');
}

export function configurePublicUploads(
  app: NestExpressApplication,
  uploadRoot: string,
): void {
  const prefix = `/${uploadRoot}`;
  const diskRoot = join(process.cwd(), uploadRoot);

  app.use(
    prefix,
    (request: Request, response: Response, next: NextFunction) => {
      if (!isPublicUploadPath(`${uploadRoot}${request.path}`)) {
        response.status(404).end();
        return;
      }
      next();
    },
  );

  app.useStaticAssets(diskRoot, {
    prefix,
    setHeaders(response: Response, filePath: string) {
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Content-Type', contentTypeForPublicImage(filePath));
      response.setHeader('Content-Disposition', 'inline');
    },
  });
}
