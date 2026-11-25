import { IsEnum, IsOptional, Matches } from 'class-validator';
import {
  FeedbackFound,
  FeedbackKarabakh,
} from '../../../generated/prisma/enums.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Filters shared by list, summary and export. Dates are Yerevan calendar days (YYYY-MM-DD). */
export class FeedbackFilterQueryDto {
  @IsOptional()
  @Matches(DATE_ONLY, { message: 'from must be a YYYY-MM-DD date' })
  from?: string;

  @IsOptional()
  @Matches(DATE_ONLY, { message: 'to must be a YYYY-MM-DD date' })
  to?: string;

  @IsOptional()
  @IsEnum(FeedbackFound)
  found?: FeedbackFound;

  @IsOptional()
  @IsEnum(FeedbackKarabakh)
  fromKarabakh?: FeedbackKarabakh;
}

export class FeedbackListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Matches(DATE_ONLY, { message: 'from must be a YYYY-MM-DD date' })
  from?: string;

  @IsOptional()
  @Matches(DATE_ONLY, { message: 'to must be a YYYY-MM-DD date' })
  to?: string;

  @IsOptional()
  @IsEnum(FeedbackFound)
  found?: FeedbackFound;

  @IsOptional()
  @IsEnum(FeedbackKarabakh)
  fromKarabakh?: FeedbackKarabakh;
}
