import { Injectable } from '@nestjs/common';
import { OrganisationsService } from '../../modules/organisations/organisations.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';

@Injectable()
export class GetManyOrganisationsUseCase {
  constructor(private readonly organisationsService: OrganisationsService) {}
  async execute(query: PaginationQuery & { search?: string; status?: OrganisationStatus }) {
    return this.organisationsService.findMany(query);
  }
}
