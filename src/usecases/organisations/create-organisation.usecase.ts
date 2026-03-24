import { Injectable } from '@nestjs/common';
import { OrganisationsService } from '../../modules/organisations/organisations.service.js';

@Injectable()
export class CreateOrganisationUseCase {
  constructor(private readonly organisationsService: OrganisationsService) {}
  async execute(data: {
    name: string;
    description?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    regionId?: string;
  }) {
    return this.organisationsService.create(data);
  }
}
