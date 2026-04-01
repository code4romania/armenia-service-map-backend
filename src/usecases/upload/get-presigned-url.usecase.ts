import { Injectable } from '@nestjs/common';
import { UploadService, CreatePresignedUrlInput } from '../../modules/upload/upload.service.js';

@Injectable()
export class GetPresignedUrlUseCase {
  constructor(private readonly uploadService: UploadService) {}

  async execute(input: CreatePresignedUrlInput) {
    return this.uploadService.createPresignedUrl(input);
  }
}
