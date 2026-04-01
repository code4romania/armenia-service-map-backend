import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  Role,
  UserStatus,
  OrganisationStatus,
  EntityStatus,
  ServiceStatus,
  NeedStatus,
  NeedReportEventType,
  NotificationType,
} from '../src/generated/prisma/client.js';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.notification.deleteMany();
  await prisma.needReportEvent.deleteMany();
  await prisma.searchLog.deleteMany();
  await prisma.needReportTag.deleteMany();
  await prisma.needReport.deleteMany();
  await prisma.serviceTargetGroup.deleteMany();
  await prisma.serviceTopic.deleteMany();
  await prisma.service.deleteMany();
  await prisma.needTag.deleteMany();
  await prisma.targetGroup.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.region.deleteMany();

  const passwordHash = await bcrypt.hash('admin123', 10);

  const regions = [
    { name: 'Yerevan', slug: 'yerevan', svgPathId: 'region-yerevan' },
    { name: 'Aragatsotn', slug: 'aragatsotn', svgPathId: 'region-aragatsotn' },
    { name: 'Ararat', slug: 'ararat', svgPathId: 'region-ararat' },
    { name: 'Armavir', slug: 'armavir', svgPathId: 'region-armavir' },
    { name: 'Gegharkunik', slug: 'gegharkunik', svgPathId: 'region-gegharkunik' },
    { name: 'Kotayk', slug: 'kotayk', svgPathId: 'region-kotayk' },
    { name: 'Lori', slug: 'lori', svgPathId: 'region-lori' },
    { name: 'Shirak', slug: 'shirak', svgPathId: 'region-shirak' },
    { name: 'Syunik', slug: 'syunik', svgPathId: 'region-syunik' },
    { name: 'Tavush', slug: 'tavush', svgPathId: 'region-tavush' },
    { name: 'Vayots Dzor', slug: 'vayots-dzor', svgPathId: 'region-vayots-dzor' },
  ];

  const createdRegions = await Promise.all(
    regions.map((region) =>
      prisma.region.create({
        data: region,
      }),
    ),
  );
  const yerevan = createdRegions.find((region) => region.slug === 'yerevan')!;

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@refugeesupport.am',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      lastAccessAt: new Date(),
    },
  });

  const organisation = await prisma.organisation.create({
    data: {
      name: 'Refugee Support Armenia',
      legalName: 'Refugee Support Armenia Foundation',
      description: 'Humanitarian support and service coordination.',
      website: 'https://refugeesupport.am',
      country: 'Armenia',
      streetAddress: '12 Abovyan Street',
      location: 'Yerevan',
      organisationType: 'NGO',
      uniqueIdentifier: 'ORG-001',
      category: 'Humanitarian',
      activityDomain: 'Social Protection',
      legalRepName: 'Anahit Petrosyan',
      legalRepEmail: 'legal@refugeesupport.am',
      legalRepPhone: '+37410000001',
      contactPersonName: 'Mariam Sargsyan',
      contactPersonEmail: 'contact@refugeesupport.am',
      contactPersonPhone: '+37410000002',
      status: OrganisationStatus.ACTIVE,
      regionId: yerevan.id,
      tags: ['refugee', 'social-services'],
      observations: 'Primary pilot organisation for development environment.',
    },
  });

  const orgAdmin = await prisma.user.create({
    data: {
      email: 'org-admin@refugeesupport.am',
      passwordHash,
      firstName: 'Org',
      lastName: 'Admin',
      phone: '+37410000003',
      role: Role.ORG_ADMIN,
      status: UserStatus.ACTIVE,
      organisationId: organisation.id,
      lastAccessAt: new Date(),
    },
  });

  const orgMember = await prisma.user.create({
    data: {
      email: 'org-member@refugeesupport.am',
      passwordHash,
      firstName: 'Org',
      lastName: 'Member',
      phone: '+37410000004',
      role: Role.ORG_MEMBER,
      status: UserStatus.PENDING,
      organisationId: organisation.id,
    },
  });

  const healthTopic = await prisma.topic.create({
    data: {
      name: 'Health and Mental Health',
      slug: 'health-mental-health',
      status: EntityStatus.ACTIVE,
      sortOrder: 1,
    },
  });
  const legalTopic = await prisma.topic.create({
    data: {
      name: 'Legal Advice',
      slug: 'legal-advice',
      status: EntityStatus.ACTIVE,
      sortOrder: 2,
    },
  });
  const traumaSubtopic = await prisma.topic.create({
    data: {
      name: 'Trauma Counseling',
      slug: 'trauma-counseling',
      parentId: healthTopic.id,
      status: EntityStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  const urgentNeedTag = await prisma.needTag.create({
    data: {
      name: 'Urgent',
      slug: 'urgent',
      status: EntityStatus.ACTIVE,
    },
  });
  const housingNeedTag = await prisma.needTag.create({
    data: {
      name: 'Housing',
      slug: 'housing',
      status: EntityStatus.ACTIVE,
    },
  });

  const womenTargetGroup = await prisma.targetGroup.create({
    data: {
      name: 'Women',
      status: EntityStatus.ACTIVE,
    },
  });
  const childrenTargetGroup = await prisma.targetGroup.create({
    data: {
      name: 'Children',
      status: EntityStatus.ACTIVE,
    },
  });

  const service = await prisma.service.create({
    data: {
      title: 'Legal Orientation Clinic',
      shortDescription: 'Weekly legal orientation for displaced families.',
      description: 'Consultations on documentation, residency, and legal aid referrals.',
      organisationId: organisation.id,
      regionId: yerevan.id,
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topics: {
        create: [
          { topicId: legalTopic.id },
          { topicId: traumaSubtopic.id },
        ],
      },
      targetGroups: {
        create: [
          { targetGroupId: womenTargetGroup.id },
          { targetGroupId: childrenTargetGroup.id },
        ],
      },
    },
  });

  const needReport = await prisma.needReport.create({
    data: {
      title: 'Family needs emergency shelter support',
      description: 'A displaced family requires temporary shelter and legal advice.',
      fullName: 'Aram Mkrtchyan',
      contactMethod: 'PHONE',
      contactValue: '+37410000010',
      regionId: yerevan.id,
      status: NeedStatus.IN_PROGRESS,
      assignedOrganisationId: organisation.id,
      tags: {
        create: [{ needTagId: urgentNeedTag.id }, { needTagId: housingNeedTag.id }],
      },
    },
  });

  await prisma.needReportEvent.createMany({
    data: [
      {
        needReportId: needReport.id,
        userId: adminUser.id,
        eventType: NeedReportEventType.ASSIGNED,
        content: 'Assigned to organisation',
        metadata: { organisationId: organisation.id },
      },
      {
        needReportId: needReport.id,
        userId: orgAdmin.id,
        eventType: NeedReportEventType.COMMENT,
        content: 'We contacted the family and started intake.',
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: orgAdmin.id,
        type: NotificationType.NEED_ASSIGNED,
        title: 'Need report assigned',
        message: `Need "${needReport.title}" was assigned to your organisation`,
        metadata: { needReportId: needReport.id },
      },
      {
        userId: adminUser.id,
        type: NotificationType.SERVICE_PUBLISHED,
        title: 'Service published',
        message: `Service "${service.title}" was published`,
        metadata: { serviceId: service.id },
      },
      {
        userId: orgMember.id,
        type: NotificationType.ORG_ACTIVATED,
        title: 'Organisation activated',
        message: `${organisation.name} is now active`,
        metadata: { organisationId: organisation.id },
      },
    ],
  });

  await prisma.searchLog.createMany({
    data: [
      {
        query: 'legal support',
        regionId: yerevan.id,
        topicIds: [legalTopic.id],
        resultsCount: 1,
      },
      {
        query: 'trauma counseling',
        regionId: yerevan.id,
        topicIds: [traumaSubtopic.id],
        resultsCount: 1,
      },
    ],
  });

  console.log('Seed completed with clean-break backend sample data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
