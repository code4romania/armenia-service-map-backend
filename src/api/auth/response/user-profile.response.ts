import { Type } from 'class-transformer';

export class OrgSummaryResponse {
  id: string;
  name: string;
}

export class UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;

  @Type(() => OrgSummaryResponse)
  organisation: OrgSummaryResponse | null;

  createdAt: Date;
}
