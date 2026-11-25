import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './infrastructure/filters/global-exception.filter.js';
import { runDatabaseInitFromEnv } from './infrastructure/bootstrap/database-init.js';

async function bootstrap() {
  await runDatabaseInitFromEnv();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Trust the first reverse-proxy hop so req.ip is the real client (throttling).
  app.set('trust proxy', Number(config.get<string>('TRUST_PROXY_HOPS') ?? 1));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors({
    origin: config.get('CORS_ORIGIN'),
    credentials: true,
    // Let the cross-origin frontend read download filenames (e.g. the feedback CSV export).
    exposedHeaders: ['Content-Disposition'],
  });

  app.setGlobalPrefix('api');

  const port = config.get('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
