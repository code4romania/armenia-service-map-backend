import { Injectable } from '@nestjs/common';
import { OrganisationsService } from '../../modules/organisations/organisations.service.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';

@Injectable()
export class UpdateOrganisationUseCase {
  constructor(private readonly organisationsService: OrganisationsService) {}
  async execute(id: string, data: {
    name?: string;
    legalName?: string;
    description?: string;
    website?: string;
    country?: string;
    streetAddress?: string;
    location?: string;
    organisationType?: string;
    uniqueIdentifier?: string;
    category?: string;
    activityDomain?: string;
    legalRepName?: string;
    legalRepEmail?: string;
    legalRepPhone?: string;
    contactPersonName?: string;
    contactPersonEmail?: string;
    contactPersonPhone?: string;
    legalDocumentUrl?: string;
    logoUrl?: string;
    observations?: string;
    tags?: string[];
    status?: OrganisationStatus;
    regionIds?: string[];
  }) {
    return this.organisationsService.update(id, data);
  }
}
