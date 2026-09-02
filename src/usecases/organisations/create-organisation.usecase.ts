import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { EmailService } from '../../infrastructure/email/email.service.js';
import { Role } from '../../common/enums/role.enum.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import {
  sendInvitationEmail,
  splitContactName,
} from './helpers/join-network-invitation.js';

type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: Role;
};

/**
 * Admin-initiated organisation creation. Unlike the public join-network flow, the
 * organisation is trusted from the start: it is created ACTIVE (no review step) and
 * an ORG_ADMIN account is provisioned immediately from the contact email.
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
      contactPersonEmail: string;
      contactPersonPhone?: string;
      legalDocumentUrl?: string;
      logoUrl?: string;
      observations?: string;
      tags?: string[];
      regionId?: string;
      users?: NewUser[];
    },
    createdByUserId: string,
  ) {
    const { users = [], ...orgData } = data;
    const contactEmail = data.contactPersonEmail.trim().toLowerCase();

    const contactAdmin: NewUser = {
      ...splitContactName(data.contactPersonName),
      email: contactEmail,
      phone: data.contactPersonPhone,
      role: Role.ORG_ADMIN,
    };
    const extraUsers = users
      .map((user) => ({ ...user, email: user.email.trim().toLowerCase() }))
      .filter((user) => user.email !== contactEmail);
    const usersToCreate = [contactAdmin, ...extraUsers];

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
          contactPersonEmail: contactEmail,
          tags: orgData.tags ?? [],
          status: OrganisationStatus.ACTIVE,
          submissionSource: 'ADMIN',
          reviewedAt: new Date(),
          reviewedByUserId: createdByUserId,
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

    return this.prisma.organisation.findUnique({
      where: { id: result.organisation.id, deletedAt: null },
      include: {
        region: true,
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
  }
}
