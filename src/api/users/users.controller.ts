import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { IsOptional, IsUUID } from 'class-validator';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { GetManyUsersUseCase } from '../../usecases/users/get-many-users.usecase.js';
import { GetOneUserUseCase } from '../../usecases/users/get-one-user.usecase.js';
import { CreateUserUseCase } from '../../usecases/users/create-user.usecase.js';
import { UpdateUserUseCase } from '../../usecases/users/update-user.usecase.js';
import { DeleteUserUseCase } from '../../usecases/users/delete-user.usecase.js';

export class UserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}

@Controller('admin/users')
@Roles(Role.SUPER_ADMIN)
export class UsersController {
  constructor(
    private readonly getManyUsers: GetManyUsersUseCase,
    private readonly getOneUser: GetOneUserUseCase,
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Get()
  async list(@Query() query: UserQueryDto) {
    return this.getManyUsers.execute(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.getOneUser.execute(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.updateUser.execute(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deleteUser.execute(id);
  }
}
