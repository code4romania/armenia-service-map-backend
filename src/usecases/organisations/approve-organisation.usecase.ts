import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { EmailService } from '../../modules/email/email.service.js';
import { NotificationsService } from '../../modules/notifications/notifications.service.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';
import { Role } from '../../common/enums/role.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import { NotificationType } from '../../common/enums/notification-type.enum.js';
import { sendInvitationEmail, splitContactName } from './helpers/join-network-invitation.js';

@Injectable()
export class ApproveOrganisationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
    private readonly emailService: EmailService,
    private readonly notifications: NotificationsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async execute(id: string, reviewerId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id, deletedAt: null },
      include: { region: true },
    });

    if (!organisation) {
      throw this.exceptions.notFound('Organisation', id);
    }
    if (organisation.status !== OrganisationStatus.PENDING) {
      throw this.exceptions.badRequest('Only pending organisations can be approved');
    }
    if (!organisation.contactPersonEmail) {
      throw this.exceptions.badRequest('Pending organisation is missing a contact email');
    }
    const contactEmail = organisation.contactPersonEmail;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: contactEmail },
    });
    if (existingUser && !existingUser.deletedAt) {
      throw this.exceptions.conflict('User', `Email "${contactEmail}" already exists`);
    }

    const { firstName, lastName } = splitContactName(organisation.contactPersonName);
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedOrganisation = await tx.organisation.update({
        where: { id },
        data: {
          status: OrganisationStatus.ACTIVE,
          reviewedAt: new Date(),
          reviewedByUserId: reviewerId,
          rejectionReason: null,
        },
        include: {
          region: true,
          users: {
            where: { deletedAt: null },
            select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
          },
          _count: { select: { services: true, users: true } },
        },
      });

      const user = await tx.user.create({
        data: {
          email: contactEmail,
          firstName,
          lastName,
          phone: organisation.contactPersonPhone,
          role: Role.ORG_ADMIN,
          status: UserStatus.PENDING,
          organisationId: organisation.id,
          passwordHash,
        },
      });

      return { updatedOrganisation, user };
    });

    await sendInvitationEmail({
      userId: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      organisationName: result.updatedOrganisation.name,
      jwt: this.jwt,
      config: this.config,
      emailService: this.emailService,
    });

    const superAdmins = await this.prisma.user.findMany({
      where: { role: Role.SUPER_ADMIN, deletedAt: null, id: { not: reviewerId } },
      select: { id: true },
    });

    await this.notifications.createMany(
      superAdmins.map((admin) => admin.id),
      {
        type: NotificationType.ORG_REVIEWED,
        title: 'Organisation approved',
        message: `${result.updatedOrganisation.name} has been approved.`,
        metadata: {
          organisationId: result.updatedOrganisation.id,
          route: `/admin/organisations/${result.updatedOrganisation.id}`,
          redirectTo: `organizations/${result.updatedOrganisation.id}`,
          outcome: 'APPROVED',
        },
      },
    );

    return result.updatedOrganisation;
  }
}
