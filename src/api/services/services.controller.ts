import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { ServiceQueryDto } from './dto/service-query.dto.js';
import { GetManyServicesUseCase } from '../../usecases/services/get-many-services.usecase.js';
import { GetOneServiceUseCase } from '../../usecases/services/get-one-service.usecase.js';
import { CreateServiceUseCase } from '../../usecases/services/create-service.usecase.js';
import { UpdateServiceUseCase } from '../../usecases/services/update-service.usecase.js';
import { DeleteServiceUseCase } from '../../usecases/services/delete-service.usecase.js';

@Controller('admin/services')
@Roles(Role.SUPER_ADMIN)
export class ServicesController {
  constructor(
    private readonly getManyServices: GetManyServicesUseCase,
    private readonly getOneService: GetOneServiceUseCase,
    private readonly createService: CreateServiceUseCase,
    private readonly updateService: UpdateServiceUseCase,
    private readonly deleteService: DeleteServiceUseCase,
  ) {}

  @Get()
  async list(@Query() query: ServiceQueryDto) {
    return this.getManyServices.execute(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.getOneService.execute(id);
  }

  @Post()
  async create(@Body() dto: CreateServiceDto) {
    return this.createService.execute({
      ...dto,
      availabilityStart: dto.availabilityStart ? new Date(dto.availabilityStart) : undefined,
      availabilityEnd: dto.availabilityEnd ? new Date(dto.availabilityEnd) : undefined,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.updateService.execute(id, {
      ...dto,
      availabilityStart: dto.availabilityStart ? new Date(dto.availabilityStart) : undefined,
      availabilityEnd: dto.availabilityEnd ? new Date(dto.availabilityEnd) : undefined,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deleteService.execute(id);
  }
}
