import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { EmailService } from '../../modules/email/email.service.js';
import { Role } from '../../common/enums/role.enum.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';

@Injectable()
export class CreateOrganisationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async execute(data: {
    name: string;
    legalName?: string;
    description?: string;
    website?: string;
    country?: string;
    streetAddress?: string;
    location?: string;
    organisationType?: string;
    uniqueIdentifier?: string;
    category?: string;
    activityDomain?: string;
    legalRepName?: string;
    legalRepEmail?: string;
    legalRepPhone?: string;
    contactPersonName?: string;
    contactPersonEmail?: string;
    contactPersonPhone?: string;
    legalDocumentUrl?: string;
    logoUrl?: string;
    observations?: string;
    tags?: string[];
    regionId?: string;
    users?: Array<{
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      role?: Role;
    }>;
  }) {
    const { users = [], ...orgData } = data;

    const result = await this.prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          ...orgData,
          status: OrganisationStatus.PENDING,
          tags: orgData.tags ?? [],
        },
      });

      const createdUsers = await Promise.all(
        users.map(async (user) => {
          const tempPassword = Math.random().toString(36).slice(-12);
          const passwordHash = await bcrypt.hash(tempPassword, 10);
          return tx.user.create({
            data: {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              role: user.role ?? Role.ORG_MEMBER,
              status: UserStatus.PENDING,
              organisationId: organisation.id,
              passwordHash,
            },
          });
        }),
      );

      return { organisation, createdUsers };
    });

    await Promise.all(
      result.createdUsers.map(async (user) => {
        const token = await this.jwt.signAsync(
          { sub: user.id, type: 'setup-password' },
          {
            secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
            expiresIn: '7d',
          },
        );
        const setupUrl = `${this.config.get('CORS_ORIGIN', 'http://localhost:3001')}/setup-password?token=${token}`;
        await this.emailService.sendInvitation({
          to: user.email,
          recipientName: `${user.firstName} ${user.lastName}`,
          organisationName: result.organisation.name,
          setupUrl,
        });
      }),
    );

    return this.prisma.organisation.findUnique({
      where: { id: result.organisation.id, deletedAt: null },
      include: {
        region: true,
        users: {
          where: { deletedAt: null },
          select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
        },
        _count: { select: { services: true } },
      },
    });
  }
}
