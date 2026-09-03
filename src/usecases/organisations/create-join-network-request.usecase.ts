import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrganisationsService } from '../../modules/organisations/organisations.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { NotificationsService } from '../../modules/notifications/notifications.service.js';
import { EmailService } from '../../infrastructure/email/email.service.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';
import { Role } from '../../common/enums/role.enum.js';
import { NotificationType } from '../../common/enums/notification-type.enum.js';

@Injectable()
export class CreateJoinNetworkRequestUseCase {
  private readonly logger = new Logger(CreateJoinNetworkRequestUseCase.name);

  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async execute(data: {
    organisationName: string;
    regionIds?: string[];
    contactName: string;
    email: string;
    phone?: string;
    servicesDescription: string;
  }) {
    const organisation = await this.organisationsService.create({
      name: data.organisationName.trim(),
      description: data.servicesDescription.trim(),
      regionIds: data.regionIds ?? [],
      contactPersonName: data.contactName.trim(),
      contactPersonEmail: data.email.trim().toLowerCase(),
      contactPersonPhone: data.phone?.trim(),
      status: OrganisationStatus.PENDING,
      submissionSource: 'JOIN_NETWORK',
    });

    const superAdmins = await this.prisma.user.findMany({
      where: { role: Role.SUPER_ADMIN, deletedAt: null },
      select: { id: true, email: true },
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

    try {
      const baseUrl = this.config.get<string>('CORS_ORIGIN', 'http://localhost:3001');
      const adminUrl = `${baseUrl}/admin/organisations/${organisation.id}`;
      await Promise.all(
        superAdmins.map((admin) =>
          this.email.sendNewJoinNetworkRequestToAdmin({
            to: admin.email,
            organisationName: organisation.name,
            contactName: data.contactName.trim(),
            contactEmail: data.email.trim().toLowerCase(),
            servicesDescription: data.servicesDescription.trim(),
            regionNames: organisation.regions.map((region) => region.name),
            adminUrl,
          }),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Failed to email super admins of join-network request ${organisation.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return organisation;
  }
}
