import { Injectable } from '@nestjs/common';
import { OrganisationsService } from '../../modules/organisations/organisations.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { NotificationsService } from '../../modules/notifications/notifications.service.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';
import { Role } from '../../common/enums/role.enum.js';
import { NotificationType } from '../../common/enums/notification-type.enum.js';

@Injectable()
export class CreateJoinNetworkRequestUseCase {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(data: {
    organisationName: string;
    regionId?: string;
    contactName: string;
    email: string;
    phone?: string;
    servicesDescription: string;
  }) {
    const organisation = await this.organisationsService.create({
      name: data.organisationName.trim(),
      description: data.servicesDescription.trim(),
      regionId: data.regionId,
      contactPersonName: data.contactName.trim(),
      contactPersonEmail: data.email.trim().toLowerCase(),
      contactPersonPhone: data.phone?.trim(),
      status: OrganisationStatus.PENDING,
      submissionSource: 'JOIN_NETWORK',
    });

    const superAdmins = await this.prisma.user.findMany({
      where: { role: Role.SUPER_ADMIN, deletedAt: null },
      select: { id: true },
    });

    await this.notifications.createMany(
      superAdmins.map((admin) => admin.id),
      {
        type: NotificationType.ORG_PENDING_REVIEW,
        title: 'New organisation pending review',
        message: `${organisation.name} submitted a join-network request.`,
        metadata: {
          organisationId: organisation.id,
          route: `/admin/organisations/${organisation.id}`,
          redirectTo: `organizations/${organisation.id}`,
          outcome: 'PENDING_REVIEW',
        },
      },
    );

    return organisation;
  }
}
