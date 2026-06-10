import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { SubscriptionsService } from '../../modules/subscriptions/subscriptions.service.js';
import { EmailService } from '../../infrastructure/email/email.service.js';
import { SubscriptionLocale } from '../../infrastructure/email/templates/subscription-confirmation.template.js';

@Injectable()
export class NotifyMatchingSubscribersUseCase {
  private readonly logger = new Logger(NotifyMatchingSubscribersUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptions: SubscriptionsService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async execute(serviceId: string): Promise<void> {
    try {
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
        select: {
          id: true,
          status: true,
          title: true,
          titleHy: true,
          shortDescription: true,
          shortDescriptionHy: true,
          regionId: true,
          topics: { select: { topicId: true } },
        },
      });
      if (!service || service.status !== 'PUBLISHED') return;

      const matches = await this.subscriptions.findMatching({
        regionId: service.regionId,
        topicIds: service.topics.map((t) => t.topicId),
      });

      // Dedupe by subscriber: one email per subscriber per published service.
      const bySubscriber = new Map<string, (typeof matches)[number]['subscriber']>();
      for (const m of matches) bySubscriber.set(m.subscriber.id, m.subscriber);

      const origin = this.config.get<string>('CORS_ORIGIN', 'http://localhost:3001');
      const serviceUrl = `${origin}/services/${service.id}`;

      await Promise.all(
        [...bySubscriber.values()].map((subscriber) => {
          const locale = (subscriber.locale === 'hy' ? 'hy' : 'en') as SubscriptionLocale;
          const serviceTitle =
            (locale === 'hy'
              ? service.titleHy ?? service.title
              : service.title ?? service.titleHy) ?? '';
          const serviceShortDescription =
            (locale === 'hy'
              ? service.shortDescriptionHy ?? service.shortDescription
              : service.shortDescription ?? service.shortDescriptionHy) ?? '';
          return this.email
            .sendNewServiceNotification({
              to: subscriber.email,
              locale,
              serviceTitle,
              serviceShortDescription,
              serviceUrl,
              unsubscribeUrl: `${origin}/unsubscribe?token=${subscriber.unsubscribeToken}`,
            })
            .catch((err) => this.logger.error(`Failed to notify ${subscriber.email}`, err as Error));
        }),
      );
    } catch (err) {
      this.logger.error(`Failed to notify subscribers for service ${serviceId}`, err as Error);
    }
  }
}
