import { Controller, Get, Post, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CreateOrgServiceDto } from './dto/create-org-service.dto.js';
import { UpdateServiceDto } from '../services/dto/update-service.dto.js';
import { GetManyServicesUseCase } from '../../usecases/services/get-many-services.usecase.js';
import { GetOneServiceUseCase } from '../../usecases/services/get-one-service.usecase.js';
import { CreateServiceUseCase } from '../../usecases/services/create-service.usecase.js';
import { UpdateServiceUseCase } from '../../usecases/services/update-service.usecase.js';
import { PublishServiceUseCase } from '../../usecases/services/publish-service.usecase.js';
import { UnpublishServiceUseCase } from '../../usecases/services/unpublish-service.usecase.js';
import { ServicesService } from '../../modules/services/services.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface.js';

@Controller('org/services')
@Roles(Role.ORG_ADMIN, Role.ORG_MEMBER)
export class OrgServicesController {
  constructor(
    private readonly getManyServices: GetManyServicesUseCase,
    private readonly getOneService: GetOneServiceUseCase,
    private readonly createService: CreateServiceUseCase,
    private readonly updateService: UpdateServiceUseCase,
    private readonly publishService: PublishServiceUseCase,
    private readonly unpublishService: UnpublishServiceUseCase,
    private readonly servicesService: ServicesService,
    private readonly exceptions: DomainExceptionService,
  ) {}

  private getOrgId(req: AuthenticatedRequest): string {
    const orgId = req.user.organisationId;
    if (!orgId) throw this.exceptions.forbidden('Service', 'You must belong to an organisation');
    return orgId;
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest, @Query() query: PaginationQueryDto) {
    return this.getManyServices.execute({ ...query, organisationId: this.getOrgId(req) });
  }

  @Get(':id')
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.servicesService.verifyOwnership(id, this.getOrgId(req));
    return this.getOneService.execute(id);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrgServiceDto) {
    return this.createService.execute({
      ...dto,
      organisationId: this.getOrgId(req),
      availabilityStart: dto.availabilityStart ? new Date(dto.availabilityStart) : undefined,
      availabilityEnd: dto.availabilityEnd ? new Date(dto.availabilityEnd) : undefined,
    });
  }

  @Patch(':id')
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateServiceDto) {
    await this.servicesService.verifyOwnership(id, this.getOrgId(req));
    return this.updateService.execute(id, {
      ...dto,
      availabilityStart: dto.availabilityStart ? new Date(dto.availabilityStart) : undefined,
      availabilityEnd: dto.availabilityEnd ? new Date(dto.availabilityEnd) : undefined,
    });
  }

  @Post(':id/publish')
  async publish(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.servicesService.verifyOwnership(id, this.getOrgId(req));
    return this.publishService.execute(id);
  }

  @Post(':id/unpublish')
  async unpublish(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.servicesService.verifyOwnership(id, this.getOrgId(req));
    return this.unpublishService.execute(id);
  }
}
