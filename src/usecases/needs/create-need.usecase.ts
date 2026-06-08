import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NeedsService } from '../../modules/needs/needs.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { NotificationsService } from '../../modules/notifications/notifications.service.js';
import { EmailService } from '../../modules/email/email.service.js';
import { Role } from '../../common/enums/role.enum.js';
import { NotificationType } from '../../common/enums/notification-type.enum.js';

@Injectable()
export class CreateNeedUseCase {
  private readonly logger = new Logger(CreateNeedUseCase.name);

  constructor(
    private readonly needsService: NeedsService,
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async execute(data: {
    title?: string;
    description: string;
    fullName: string;
    contactMethod: string;
    contactValue: string;
    regionId?: string;
    tagIds?: string[];
  }) {
    const need = await this.needsService.create(data);

    try {
      await this.notifySuperAdmins(need);
    } catch (error) {
      this.logger.error(
        `Failed to notify super admins of need report ${need.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return need;
  }

  private async notifySuperAdmins(need: {
    id: string;
    title: string;
    description: string;
    fullName: string;
    region?: { name: string } | null;
  }) {
    const superAdmins = await this.prisma.user.findMany({
      where: { role: Role.SUPER_ADMIN, deletedAt: null },
      select: { id: true, email: true },
    });
    if (!superAdmins.length) return;

    await this.notifications.createMany(
      superAdmins.map((admin) => admin.id),
      {
        type: NotificationType.NEED_SUBMITTED,
        title: 'New need report submitted',
        message: `${need.fullName} submitted a need report.`,
        metadata: {
          needReportId: need.id,
          route: `/admin/needs/${need.id}`,
        },
      },
    );

    const baseUrl = this.config.get<string>('CORS_ORIGIN', 'http://localhost:3001');
    const adminUrl = `${baseUrl}/admin/needs/${need.id}`;

    await Promise.all(
      superAdmins.map((admin) =>
        this.email.sendNewNeedReportToAdmin({
          to: admin.email,
          needTitle: need.title,
          needDescription: need.description,
          reporterName: need.fullName,
          regionName: need.region?.name,
          adminUrl,
        }),
      ),
    );
  }
}
