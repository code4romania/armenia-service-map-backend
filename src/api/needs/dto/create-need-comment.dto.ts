import { IsString } from 'class-validator';

export class CreateNeedCommentDto {
  @IsString()
  content: string;
}
