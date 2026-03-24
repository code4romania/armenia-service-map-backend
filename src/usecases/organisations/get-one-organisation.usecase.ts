import { Injectable } from '@nestjs/common';
import { OrganisationsService } from '../../modules/organisations/organisations.service.js';

@Injectable()
export class GetOneOrganisationUseCase {
  constructor(private readonly organisationsService: OrganisationsService) {}
  async execute(id: string) {
    return this.organisationsService.findOne(id);
  }
}
