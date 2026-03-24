import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';

@Injectable()
export class GetOneServiceUseCase {
  constructor(private readonly servicesService: ServicesService) {}
  async execute(id: string) {
    return this.servicesService.findOne(id);
  }
}
