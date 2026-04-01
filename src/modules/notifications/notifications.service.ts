import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';
import { NotificationType } from '../../common/enums/notification-type.enum.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
  ) {}

  async create(input: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: (input.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  }

  async createMany(userIds: string[], input: {
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    if (!userIds.length) return;
    await this.prisma.notification.createMany({
      data: Array.from(new Set(userIds)).map((userId) => ({
        userId,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: (input.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
      })),
    });
  }

  async getMany(userId: string, query: PaginationQuery = {}) {
    const { page = 1, perPage = 20 } = query;
    const where = { userId };

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return paginatedResult(data, total, page, perPage);
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async markAsRead(id: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
    if (!result.count) {
      throw this.exceptions.notFound('Notification', id);
    }
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
