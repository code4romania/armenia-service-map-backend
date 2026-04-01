import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type UploadCategory = 'image' | 'document';

type UploadRuntimeConfig = {
  endpoint: string;
  bucket: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  maxImageSizeBytes?: number;
  maxDocumentSizeBytes?: number;
};

export type CreatePresignedUrlInput = {
  category: UploadCategory;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

const allowedMimeTypes: Record<UploadCategory, Set<string>> = {
  image: new Set(['image/jpeg', 'image/png', 'image/svg+xml']),
  document: new Set(['application/pdf']),
};

function normalizeFilename(filename: string): string {
  return filename.trim().replace(/[^a-zA-Z0-9._-]/g, '_');
}

@Injectable()
export class UploadService {
  private readonly runtimeConfig: Required<UploadRuntimeConfig>;
  private readonly s3Client: S3Client;

  constructor(configOrRuntime: ConfigService | UploadRuntimeConfig) {
    if ('get' in configOrRuntime) {
      this.runtimeConfig = {
        endpoint: configOrRuntime.getOrThrow<string>('S3_ENDPOINT'),
        bucket: configOrRuntime.getOrThrow<string>('S3_BUCKET'),
        region: configOrRuntime.get<string>('S3_REGION', 'us-east-1'),
        accessKey: configOrRuntime.getOrThrow<string>('S3_ACCESS_KEY'),
        secretKey: configOrRuntime.getOrThrow<string>('S3_SECRET_KEY'),
        maxImageSizeBytes: configOrRuntime.get<number>('UPLOAD_MAX_IMAGE_BYTES', 5 * 1024 * 1024),
        maxDocumentSizeBytes: configOrRuntime.get<number>('UPLOAD_MAX_DOCUMENT_BYTES', 10 * 1024 * 1024),
      };
    } else {
      this.runtimeConfig = {
        endpoint: configOrRuntime.endpoint,
        bucket: configOrRuntime.bucket,
        region: configOrRuntime.region ?? 'us-east-1',
        accessKey: configOrRuntime.accessKey ?? 'minioadmin',
        secretKey: configOrRuntime.secretKey ?? 'minioadmin',
        maxImageSizeBytes: configOrRuntime.maxImageSizeBytes ?? 5 * 1024 * 1024,
        maxDocumentSizeBytes: configOrRuntime.maxDocumentSizeBytes ?? 10 * 1024 * 1024,
      };
    }

    this.s3Client = new S3Client({
      region: this.runtimeConfig.region,
      endpoint: this.runtimeConfig.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.runtimeConfig.accessKey,
        secretAccessKey: this.runtimeConfig.secretKey,
      },
    });
  }

  async createPresignedUrl(input: CreatePresignedUrlInput) {
    if (!allowedMimeTypes[input.category].has(input.mimeType)) {
      throw new BadRequestException('Unsupported file type');
    }
    if (input.sizeBytes <= 0) {
      throw new BadRequestException('Invalid file size');
    }

    const maxSize =
      input.category === 'image'
        ? this.runtimeConfig.maxImageSizeBytes
        : this.runtimeConfig.maxDocumentSizeBytes;
    if (input.sizeBytes > maxSize) {
      throw new BadRequestException('File exceeds maximum size');
    }

    const safeName = normalizeFilename(input.filename);
    if (!safeName) {
      throw new BadRequestException('Invalid filename');
    }

    const objectKey = `${input.category}/${Date.now()}-${randomUUID()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: this.runtimeConfig.bucket,
      Key: objectKey,
      ContentType: input.mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
    const fileUrl = `${this.runtimeConfig.endpoint.replace(/\/$/, '')}/${this.runtimeConfig.bucket}/${objectKey}`;

    return {
      uploadUrl,
      fileUrl,
      objectKey,
      expiresInSeconds: 900,
    };
  }
}
