import { Injectable } from '@nestjs/common';
import { OrganisationsService } from '../../modules/organisations/organisations.service.js';

@Injectable()
export class DeleteOrganisationUseCase {
  constructor(private readonly organisationsService: OrganisationsService) {}
  async execute(id: string) {
    return this.organisationsService.softDelete(id);
  }
}
