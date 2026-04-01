import { IsIn, IsInt, IsPositive, IsString } from 'class-validator';

export class CreatePresignedUrlDto {
  @IsIn(['image', 'document'])
  category: 'image' | 'document';

  @IsString()
  filename: string;

  @IsString()
  mimeType: string;

  @IsInt()
  @IsPositive()
  sizeBytes: number;
}
