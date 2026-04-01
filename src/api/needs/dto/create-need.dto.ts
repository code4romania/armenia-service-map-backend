import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class CreateNeedDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  description: string;

  @IsString()
  fullName: string;

  @IsString()
  contactMethod: string;

  @IsString()
  contactValue: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];
}
