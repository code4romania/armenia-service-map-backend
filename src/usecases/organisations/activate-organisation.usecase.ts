import { Injectable } from '@nestjs/common';
import { OrganisationsService } from '../../modules/organisations/organisations.service.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';

@Injectable()
export class ActivateOrganisationUseCase {
  constructor(private readonly organisationsService: OrganisationsService) {}

  async execute(id: string) {
    return this.organisationsService.update(id, { status: OrganisationStatus.ACTIVE });
  }
}
