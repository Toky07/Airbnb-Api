import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { mkdir } from 'fs/promises';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { getCorsConfig } from './config/cors.config';
import { getHelmetOptions, isHelmetEnabled } from './config/helmet.config';
import { resolveUploadRoot } from './modules/media/utils/resolve-upload-root';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap() {
  const uploadRoot = resolveUploadRoot();
  await mkdir(join(process.cwd(), uploadRoot), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  if (isHelmetEnabled()) {
    app.use(helmet(getHelmetOptions()));
  }

  app.enableCors(getCorsConfig());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  app.useStaticAssets(join(process.cwd(), uploadRoot), {
    prefix: `/${uploadRoot}`,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
