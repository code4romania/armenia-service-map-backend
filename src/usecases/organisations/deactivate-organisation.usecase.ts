import { Injectable } from '@nestjs/common';
import { OrganisationsService } from '../../modules/organisations/organisations.service.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';

@Injectable()
export class DeactivateOrganisationUseCase {
  constructor(private readonly organisationsService: OrganisationsService) {}

  async execute(id: string) {
    return this.organisationsService.update(id, { status: OrganisationStatus.SUSPENDED });
  }
}
