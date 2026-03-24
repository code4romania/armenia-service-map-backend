import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';

@Injectable()
export class DomainExceptionService {
  notFound(entity: string, id?: string): NotFoundException {
    const message = id ? `${entity} with ID "${id}" not found` : `${entity} not found`;
    return new NotFoundException(message);
  }

  forbidden(entity: string, reason?: string): ForbiddenException {
    const message = reason || `You do not have permission to access this ${entity}`;
    return new ForbiddenException(message);
  }

  conflict(entity: string, reason: string): ConflictException {
    return new ConflictException(`${entity}: ${reason}`);
  }

  badRequest(message: string): BadRequestException {
    return new BadRequestException(message);
  }
}
