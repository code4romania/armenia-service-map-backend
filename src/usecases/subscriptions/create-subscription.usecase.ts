import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionsService } from '../../modules/subscriptions/subscriptions.service.js';
import { EmailService } from '../../infrastructure/email/email.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { SubscriptionLocale } from '../../infrastructure/email/templates/subscription-confirmation.template.js';

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    private readonly subscriptions: SubscriptionsService,
    private readonly email: EmailService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async execute(input: { email: string; locale?: string; regionId?: string; topicId?: string }) {
    const { subscriber, subscription } = await this.subscriptions.createOrGet(input);

    const [region, topic] = await Promise.all([
      subscription.regionId
        ? this.prisma.region.findUnique({ where: { id: subscription.regionId }, select: { name: true } })
        : Promise.resolve(null),
      subscription.topicId
        ? this.prisma.topic.findUnique({ where: { id: subscription.topicId }, select: { name: true } })
        : Promise.resolve(null),
    ]);

    const origin = this.config.get<string>('CORS_ORIGIN', 'http://localhost:3001');
    const locale = (subscriber.locale === 'hy' ? 'hy' : 'en') as SubscriptionLocale;

    await this.email.sendSubscriptionConfirmation({
      to: subscriber.email,
      locale,
      regionName: region?.name,
      topicName: topic?.name,
      unsubscribeUrl: `${origin}/unsubscribe?token=${subscriber.unsubscribeToken}`,
    });

    return { ok: true as const };
  }
}
