import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { UPLOAD_ROOT } from './modules/media/constant';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useStaticAssets(join(process.cwd(), UPLOAD_ROOT), {
    prefix: `/${UPLOAD_ROOT}`,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
