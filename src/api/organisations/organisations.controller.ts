import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CreateOrganisationDto } from './dto/create-organisation.dto.js';
import { UpdateOrganisationDto } from './dto/update-organisation.dto.js';
import { RejectOrganisationDto } from './dto/reject-organisation.dto.js';
import { GetManyOrganisationsUseCase } from '../../usecases/organisations/get-many-organisations.usecase.js';
import { GetOneOrganisationUseCase } from '../../usecases/organisations/get-one-organisation.usecase.js';
import { CreateOrganisationUseCase } from '../../usecases/organisations/create-organisation.usecase.js';
import { UpdateOrganisationUseCase } from '../../usecases/organisations/update-organisation.usecase.js';
import { DeleteOrganisationUseCase } from '../../usecases/organisations/delete-organisation.usecase.js';
import { ActivateOrganisationUseCase } from '../../usecases/organisations/activate-organisation.usecase.js';
import { DeactivateOrganisationUseCase } from '../../usecases/organisations/deactivate-organisation.usecase.js';
import { ApproveOrganisationUseCase } from '../../usecases/organisations/approve-organisation.usecase.js';
import { RejectOrganisationUseCase } from '../../usecases/organisations/reject-organisation.usecase.js';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface.js';

class OrganisationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrganisationStatus)
  status?: OrganisationStatus;
}

@Controller('admin/organisations')
@Roles(Role.SUPER_ADMIN)
export class OrganisationsController {
  constructor(
    private readonly getManyOrganisations: GetManyOrganisationsUseCase,
    private readonly getOneOrganisation: GetOneOrganisationUseCase,
    private readonly createOrganisation: CreateOrganisationUseCase,
    private readonly updateOrganisation: UpdateOrganisationUseCase,
    private readonly deleteOrganisation: DeleteOrganisationUseCase,
    private readonly activateOrganisation: ActivateOrganisationUseCase,
    private readonly deactivateOrganisation: DeactivateOrganisationUseCase,
    private readonly approveOrganisation: ApproveOrganisationUseCase,
    private readonly rejectOrganisation: RejectOrganisationUseCase,
  ) {}

  @Get()
  async list(@Query() query: OrganisationQueryDto) {
    return this.getManyOrganisations.execute(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.getOneOrganisation.execute(id);
  }

  @Post()
  async create(@Body() dto: CreateOrganisationDto) {
    return this.createOrganisation.execute(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrganisationDto) {
    return this.updateOrganisation.execute(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deleteOrganisation.execute(id);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    return this.activateOrganisation.execute(id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.deactivateOrganisation.execute(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.approveOrganisation.execute(id, req.user.sub);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() dto: RejectOrganisationDto, @Req() req: AuthenticatedRequest) {
    return this.rejectOrganisation.execute(id, req.user.sub, dto.rejectionReason);
  }
}
