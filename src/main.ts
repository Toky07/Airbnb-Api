import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { mkdir } from 'fs/promises';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { getCorsConfig } from './config/cors.config';
import { validateEnv } from './config/env.config';
import { getHelmetOptions, isHelmetEnabled } from './config/helmet.config';
import {
  configurePublicUploads,
  resolveUploadRoot,
} from './modules/media/contracts';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  validateEnv();

  const uploadRoot = resolveUploadRoot();
  await mkdir(join(process.cwd(), uploadRoot), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  if (isHelmetEnabled()) {
    app.use(helmet(getHelmetOptions()));
  }

  app.enableCors(getCorsConfig());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  configurePublicUploads(app, uploadRoot);

  setupSwagger(app);

  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
