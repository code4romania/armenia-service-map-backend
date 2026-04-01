import { plainToInstance, Type } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

export class AppConfig {
  @IsNumber()
  @Type(() => Number)
  PORT: number = 3000;

  @IsString()
  NODE_ENV: string = 'development';

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRATION: string = '15m';

  @IsString()
  JWT_REFRESH_EXPIRATION: string = '7d';

  @IsString()
  CORS_ORIGIN: string = 'http://localhost:3001';

  @IsString()
  S3_ENDPOINT: string;

  @IsString()
  S3_ACCESS_KEY: string;

  @IsString()
  S3_SECRET_KEY: string;

  @IsString()
  S3_BUCKET: string;

  @IsString()
  S3_REGION: string = 'us-east-1';

  @IsNumber()
  @Type(() => Number)
  UPLOAD_MAX_IMAGE_BYTES: number = 5 * 1024 * 1024;

  @IsNumber()
  @Type(() => Number)
  UPLOAD_MAX_DOCUMENT_BYTES: number = 10 * 1024 * 1024;

  @IsString()
  MAIL_HOST: string = 'localhost';

  @IsNumber()
  @Type(() => Number)
  MAIL_PORT: number = 1025;

  @IsString()
  MAIL_FROM: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(AppConfig, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validated;
}
