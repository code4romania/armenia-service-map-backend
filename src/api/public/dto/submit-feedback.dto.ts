import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  FeedbackFound,
  FeedbackKarabakh,
  FeedbackUsefulness,
} from '../../../generated/prisma/enums.js';

export class SubmitFeedbackDto {
  @IsEnum(FeedbackUsefulness)
  usefulness!: FeedbackUsefulness;

  @IsEnum(FeedbackFound)
  found!: FeedbackFound;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  lookingFor?: string;

  @IsEnum(FeedbackKarabakh)
  fromKarabakh!: FeedbackKarabakh;

  @IsIn(['hy', 'en'])
  locale!: 'hy' | 'en';

  @Matches(/^\/[^\s]{0,199}$/)
  pagePath!: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;
}
