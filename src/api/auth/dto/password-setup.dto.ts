import { IsString, MinLength } from 'class-validator';

export class PasswordSetupDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}
