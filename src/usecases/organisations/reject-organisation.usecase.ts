import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { EmailService } from '../../infrastructure/email/email.service.js';
import { NotificationsService } from '../../modules/notifications/notifications.service.js';
import { Role } from '../../common/enums/role.enum.js';
import { NotificationType } from '../../common/enums/notification-type.enum.js';
import { splitContactName } from './helpers/join-network-invitation.js';

@Injectable()
export class RejectOrganisationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
    private readonly emailService: EmailService,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(id: string, reviewerId: string, rejectionReason?: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id, deletedAt: null },
      include: { region: true },
    });

    if (!organisation) {
      throw this.exceptions.notFound('Organisation', id);
    }

    if (organisation.status !== OrganisationStatus.PENDING) {
      throw this.exceptions.badRequest('Only pending organisations can be rejected');
    }

    const updatedOrganisation = await this.prisma.organisation.update({
      where: { id },
      data: {
        status: OrganisationStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedByUserId: reviewerId,
        rejectionReason: rejectionReason?.trim() || null,
      },
      include: { region: true },
    });

    if (organisation.contactPersonEmail) {
      const contactName = splitContactName(organisation.contactPersonName);
      await this.emailService.sendOrganisationReviewOutcome({
        to: organisation.contactPersonEmail,
        recipientName: `${contactName.firstName} ${contactName.lastName}`.trim(),
        organisationName: organisation.name,
        outcome: 'REJECTED',
        rejectionReason: rejectionReason?.trim() || undefined,
      });
    }

    const superAdmins = await this.prisma.user.findMany({
      where: { role: Role.SUPER_ADMIN, deletedAt: null, id: { not: reviewerId } },
      select: { id: true },
    });

    await this.notifications.createMany(
      superAdmins.map((admin) => admin.id),
      {
        type: NotificationType.ORG_REVIEWED,
        title: 'Organisation rejected',
        message: `${updatedOrganisation.name} has been rejected.`,
        metadata: {
          organisationId: updatedOrganisation.id,
          route: `/admin/organisations/${updatedOrganisation.id}`,
          redirectTo: `organizations/${updatedOrganisation.id}`,
          outcome: 'REJECTED',
        },
      },
    );

    return updatedOrganisation;
  }
}
