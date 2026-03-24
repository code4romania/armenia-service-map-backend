import { IsString } from 'class-validator';

export class CreateNeedTagDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;
}
