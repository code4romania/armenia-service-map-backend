import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class JoinNetworkDto {
  @IsString()
  organisationName: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsString()
  contactName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(10)
  servicesDescription: string;
}
