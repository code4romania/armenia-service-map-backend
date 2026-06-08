import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrGet(input: { email: string; locale?: string; regionId?: string; topicId?: string }) {
    const email = input.email.trim().toLowerCase();
    const locale = input.locale ?? 'en';
    const regionId = input.regionId ?? null;
    const topicId = input.topicId ?? null;

    const subscriber = await this.prisma.subscriber.upsert({
      where: { email },
      update: { locale },
      create: { email, locale, unsubscribeToken: randomBytes(32).toString('hex') },
    });

    const existing = await this.prisma.subscription.findFirst({
      where: { subscriberId: subscriber.id, regionId, topicId },
    });

    const subscription =
      existing ??
      (await this.prisma.subscription.create({
        data: { subscriberId: subscriber.id, regionId, topicId },
      }));

    return { subscriber, subscription };
  }

  async findMatching(service: { regionId: string | null; topicIds: string[] }) {
    return this.prisma.subscription.findMany({
      where: {
        AND: [
          { OR: [{ regionId: null }, { regionId: service.regionId }] },
          { OR: [{ topicId: null }, { topicId: { in: service.topicIds } }] },
        ],
      },
      include: { subscriber: true },
    });
  }

  async deleteByToken(token: string) {
    await this.prisma.subscriber.deleteMany({ where: { unsubscribeToken: token } });
  }
}
