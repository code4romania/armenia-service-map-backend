import { IsString, MinLength } from 'class-validator';

export class UnsubscribeDto {
  @IsString()
  @MinLength(10)
  token: string;
}
