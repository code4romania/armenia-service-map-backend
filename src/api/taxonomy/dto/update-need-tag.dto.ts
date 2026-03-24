import { IsString, IsOptional } from 'class-validator';

export class UpdateNeedTagDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
