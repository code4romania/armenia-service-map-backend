import { IsArray, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class JoinNetworkDto {
  @IsString()
  organisationName: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  regionIds?: string[];

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
