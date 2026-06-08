import { IsEmail, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(['en', 'hy'])
  locale?: 'en' | 'hy';

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;
}
