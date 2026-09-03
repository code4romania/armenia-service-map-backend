import { Body, Controller, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { GetPresignedUrlUseCase } from '../../usecases/upload/get-presigned-url.usecase.js';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto.js';

@Controller('upload')
@Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
export class UploadController {
  constructor(private readonly getPresignedUrl: GetPresignedUrlUseCase) {}

  @Post('presigned-url')
  async createPresignedUrl(@Body() dto: CreatePresignedUrlDto) {
    return this.getPresignedUrl.execute(dto);
  }
}
