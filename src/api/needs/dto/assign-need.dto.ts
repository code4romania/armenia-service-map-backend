import { IsUUID } from 'class-validator';

export class AssignNeedDto {
  @IsUUID()
  organisationId: string;
}
