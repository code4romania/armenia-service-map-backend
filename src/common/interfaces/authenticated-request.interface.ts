import { Request } from 'express';
import { Role } from '../enums/role.enum.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  organisationId?: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
