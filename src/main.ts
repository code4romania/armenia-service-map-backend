import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './infrastructure/filters/global-exception.filter.js';
import { runDatabaseInitFromEnv } from './infrastructure/bootstrap/database-init.js';

async function bootstrap() {
  await runDatabaseInitFromEnv();
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

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
  });

  app.setGlobalPrefix('api');

  const port = config.get('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
