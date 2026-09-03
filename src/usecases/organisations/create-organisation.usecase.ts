import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { EmailService } from '../../infrastructure/email/email.service.js';
import { Role } from '../../common/enums/role.enum.js';
import { flattenRegions, includeOrganisationRegions } from '../../modules/organisations/organisation-regions.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import { sendInvitationEmail } from './helpers/join-network-invitation.js';

type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

/**
 * Admin-initiated organisation creation. Unlike the public join-network flow, the
 * organisation is trusted from the start: it is created ACTIVE (no review step) and
 * the ORG_ADMIN account named in `admin` is provisioned immediately.
 */
@Injectable()
export class CreateOrganisationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
    private readonly emailService: EmailService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async execute(
    data: {
      name: string;
      admin: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
      };
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
      regionIds?: string[];
      users?: NewUser[];
    },
    createdByUserId: string,
  ) {
    const { admin, users = [], regionIds, ...orgData } = data;
    const adminEmail = admin.email.trim().toLowerCase();

    const orgAdmin: NewUser = {
      firstName: admin.firstName.trim(),
      lastName: admin.lastName.trim(),
      email: adminEmail,
      phone: admin.phone,
    };
    const extraUsers = users
      .map((user) => ({ ...user, email: user.email.trim().toLowerCase() }))
      .filter((user) => user.email !== adminEmail);
    const usersToCreate = [orgAdmin, ...extraUsers];

    for (const user of usersToCreate) {
      const existing = await this.prisma.user.findUnique({
        where: { email: user.email },
      });
      if (existing && !existing.deletedAt) {
        throw this.exceptions.conflict(
          'User',
          `Email "${user.email}" already exists`,
        );
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          ...orgData,
          // The org admin doubles as the organisation's contact person unless one was given.
          contactPersonName:
            orgData.contactPersonName ??
            `${orgAdmin.firstName} ${orgAdmin.lastName}`.trim(),
          contactPersonEmail: orgData.contactPersonEmail ?? adminEmail,
          contactPersonPhone: orgData.contactPersonPhone ?? orgAdmin.phone,
          tags: orgData.tags ?? [],
          status: OrganisationStatus.ACTIVE,
          submissionSource: 'ADMIN',
          reviewedAt: new Date(),
          reviewedByUserId: createdByUserId,
          ...(regionIds
            ? { regions: { create: Array.from(new Set(regionIds)).map((regionId) => ({ regionId })) } }
            : {}),
        },
      });

      const createdUsers = await Promise.all(
        usersToCreate.map(async (user) => {
          const tempPassword = Math.random().toString(36).slice(-12);
          const passwordHash = await bcrypt.hash(tempPassword, 10);
          return tx.user.create({
            data: {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              // Every organisation user is an ORG_ADMIN; the member role was retired.
              role: Role.ORG_ADMIN,
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
      result.createdUsers.map((user) =>
        sendInvitationEmail({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organisationName: result.organisation.name,
          jwt: this.jwt,
          config: this.config,
          emailService: this.emailService,
        }),
      ),
    );

    const created = await this.prisma.organisation.findUnique({
      where: { id: result.organisation.id, deletedAt: null },
      include: {
        ...includeOrganisationRegions,
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: { select: { services: true } },
      },
    });
    return created ? flattenRegions(created) : created;
  }
}
