import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { mkdir } from 'fs/promises';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import path from 'path';
import { join } from 'path';
import { AppModule } from './app.module';
import { resolveUploadRoot } from './modules/media/utils/resolve-upload-root';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap() {
  // config({ path: path.join(process.cwd(), '.env') });
  console.log('process.env: ', process.env);
  const uploadRoot = resolveUploadRoot();
  await mkdir(join(process.cwd(), uploadRoot), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.enableCors();
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
