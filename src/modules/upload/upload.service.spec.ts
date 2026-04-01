import { UploadService } from './upload.service';

describe('UploadService', () => {
  const service = new UploadService({
    endpoint: 'http://localhost:9000',
    bucket: 'armenia-service-map',
    maxDocumentSizeBytes: 10 * 1024 * 1024,
    maxImageSizeBytes: 5 * 1024 * 1024,
  });

  it('rejects unsupported mime type', async () => {
    await expect(
      service.createPresignedUrl({
        category: 'document',
        filename: 'bad.txt',
        mimeType: 'text/plain',
        sizeBytes: 1024,
      }),
    ).rejects.toThrow('Unsupported file type');
  });
});
