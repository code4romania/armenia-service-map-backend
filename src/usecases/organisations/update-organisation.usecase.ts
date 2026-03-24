import { Injectable } from '@nestjs/common';
import { OrganisationsService } from '../../modules/organisations/organisations.service.js';

@Injectable()
export class UpdateOrganisationUseCase {
  constructor(private readonly organisationsService: OrganisationsService) {}
  async execute(id: string, data: {
    name?: string;
    description?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    regionId?: string;
    isActive?: boolean;
  }) {
    return this.organisationsService.update(id, data);
  }
}
