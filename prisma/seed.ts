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

  const regionBySlug = new Map(createdRegions.map((region) => [region.slug, region]));
  const getRegion = (slug: string) => {
    const region = regionBySlug.get(slug);
    if (!region) throw new Error(`Missing region for slug: ${slug}`);
    return region;
  };

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

  const organisationsSeed = [
    {
      key: 'mission-armenia',
      name: 'Mission Armenia',
      legalName: 'Mission Armenia Charitable NGO',
      description: 'Case management, social support, and emergency assistance for displaced households.',
      website: 'https://missionarmenia.org',
      country: 'Armenia',
      streetAddress: '9 Tumanyan Street',
      location: 'Yerevan',
      organisationType: 'NGO',
      uniqueIdentifier: 'ARM-NGO-001',
      category: 'Humanitarian',
      activityDomain: 'Social Protection',
      legalRepName: 'Anahit Sargsyan',
      legalRepEmail: 'legal@missionarmenia.org',
      legalRepPhone: '+37410550001',
      contactPersonName: 'Lilit Hakobyan',
      contactPersonEmail: 'info@missionarmenia.org',
      contactPersonPhone: '+37410550002',
      status: OrganisationStatus.ACTIVE,
      regionSlug: 'yerevan',
      tags: ['social-support', 'cash-assistance'],
      observations: 'Provides rapid social intake in Yerevan and nearby communities.',
    },
    {
      key: 'armenian-caritas',
      name: 'Armenian Caritas',
      legalName: 'Armenian Caritas Benevolent NGO',
      description: 'Community-based protection, psychosocial support, and legal referrals.',
      website: 'https://caritas.am',
      country: 'Armenia',
      streetAddress: '18 Gayi Street',
      location: 'Gyumri',
      organisationType: 'Faith-based NGO',
      uniqueIdentifier: 'ARM-NGO-002',
      category: 'Protection',
      activityDomain: 'Community Services',
      legalRepName: 'Mher Mkrtchyan',
      legalRepEmail: 'legal@caritas.am',
      legalRepPhone: '+37431220001',
      contactPersonName: 'Mariam Avetisyan',
      contactPersonEmail: 'services@caritas.am',
      contactPersonPhone: '+37431220002',
      status: OrganisationStatus.ACTIVE,
      regionSlug: 'shirak',
      tags: ['psychosocial', 'community'],
      observations: 'Strong outreach in Shirak and Lori regions.',
    },
    {
      key: 'people-in-need',
      name: 'People in Need Armenia',
      legalName: 'People in Need Armenia Foundation',
      description: 'Livelihood, housing adaptation, and inclusive services for vulnerable families.',
      website: 'https://armenia.peopleinneed.net',
      country: 'Armenia',
      streetAddress: '23 Tigran Mets Avenue',
      location: 'Vanadzor',
      organisationType: 'International NGO',
      uniqueIdentifier: 'ARM-NGO-003',
      category: 'Livelihood',
      activityDomain: 'Economic Inclusion',
      legalRepName: 'Jiri Novak',
      legalRepEmail: 'legal@peopleinneed.am',
      legalRepPhone: '+37432270001',
      contactPersonName: 'Sona Abrahamyan',
      contactPersonEmail: 'support@peopleinneed.am',
      contactPersonPhone: '+37432270002',
      status: OrganisationStatus.ACTIVE,
      regionSlug: 'lori',
      tags: ['livelihood', 'housing'],
      observations: 'Pilots cash-for-work and rental support projects.',
    },
    {
      key: 'full-life',
      name: 'Full Life NGO',
      legalName: 'Full Life Social Assistance NGO',
      description: 'Disability inclusion and rehabilitation services with referral pathways.',
      website: 'https://fulllifearmenia.org',
      country: 'Armenia',
      streetAddress: '7 Azatutyan Avenue',
      location: 'Abovyan',
      organisationType: 'NGO',
      uniqueIdentifier: 'ARM-NGO-004',
      category: 'Disability Inclusion',
      activityDomain: 'Health and Inclusion',
      legalRepName: 'Narine Harutyunyan',
      legalRepEmail: 'legal@fulllifearmenia.org',
      legalRepPhone: '+37422290001',
      contactPersonName: 'Gor Melkonyan',
      contactPersonEmail: 'contact@fulllifearmenia.org',
      contactPersonPhone: '+37422290002',
      status: OrganisationStatus.ACTIVE,
      regionSlug: 'kotayk',
      tags: ['disability', 'inclusion'],
      observations: 'Accessible transport support can be arranged case by case.',
    },
  ];

  const createdOrganisations = await Promise.all(
    organisationsSeed.map((organisation) =>
      prisma.organisation.create({
        data: {
          name: organisation.name,
          legalName: organisation.legalName,
          description: organisation.description,
          website: organisation.website,
          country: organisation.country,
          streetAddress: organisation.streetAddress,
          location: organisation.location,
          organisationType: organisation.organisationType,
          uniqueIdentifier: organisation.uniqueIdentifier,
          category: organisation.category,
          activityDomain: organisation.activityDomain,
          legalRepName: organisation.legalRepName,
          legalRepEmail: organisation.legalRepEmail,
          legalRepPhone: organisation.legalRepPhone,
          contactPersonName: organisation.contactPersonName,
          contactPersonEmail: organisation.contactPersonEmail,
          contactPersonPhone: organisation.contactPersonPhone,
          status: organisation.status,
          regionId: getRegion(organisation.regionSlug).id,
          tags: organisation.tags,
          observations: organisation.observations,
        },
      }),
    ),
  );

  const organisationByKey = new Map(
    organisationsSeed.map((seed, index) => [seed.key, createdOrganisations[index]]),
  );
  const getOrganisation = (key: string) => {
    const organisation = organisationByKey.get(key);
    if (!organisation) throw new Error(`Missing organisation for key: ${key}`);
    return organisation;
  };

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'org-admin@missionarmenia.org',
        passwordHash,
        firstName: 'Lilit',
        lastName: 'Hakobyan',
        phone: '+37410550003',
        role: Role.ORG_ADMIN,
        status: UserStatus.ACTIVE,
        organisationId: getOrganisation('mission-armenia').id,
        lastAccessAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'org-member@missionarmenia.org',
        passwordHash,
        firstName: 'Arman',
        lastName: 'Petrosyan',
        phone: '+37410550004',
        role: Role.ORG_MEMBER,
        status: UserStatus.ACTIVE,
        organisationId: getOrganisation('mission-armenia').id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'org-admin@caritas.am',
        passwordHash,
        firstName: 'Mariam',
        lastName: 'Avetisyan',
        phone: '+37431220003',
        role: Role.ORG_ADMIN,
        status: UserStatus.ACTIVE,
        organisationId: getOrganisation('armenian-caritas').id,
        lastAccessAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'org-admin@peopleinneed.am',
        passwordHash,
        firstName: 'Sona',
        lastName: 'Abrahamyan',
        phone: '+37432270003',
        role: Role.ORG_ADMIN,
        status: UserStatus.ACTIVE,
        organisationId: getOrganisation('people-in-need').id,
        lastAccessAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'org-admin@fulllifearmenia.org',
        passwordHash,
        firstName: 'Gor',
        lastName: 'Melkonyan',
        phone: '+37422290003',
        role: Role.ORG_ADMIN,
        status: UserStatus.ACTIVE,
        organisationId: getOrganisation('full-life').id,
        lastAccessAt: new Date(),
      },
    }),
  ]);

  const userByEmail = new Map(users.map((user) => [user.email, user]));

  const topLevelTopics = await Promise.all([
    prisma.topic.create({ data: { name: 'Legal Services', slug: 'legal-services', status: EntityStatus.ACTIVE, sortOrder: 1 } }),
    prisma.topic.create({ data: { name: 'Healthcare', slug: 'healthcare', status: EntityStatus.ACTIVE, sortOrder: 2 } }),
    prisma.topic.create({ data: { name: 'Education', slug: 'education', status: EntityStatus.ACTIVE, sortOrder: 3 } }),
    prisma.topic.create({ data: { name: 'Shelter and Housing', slug: 'shelter-housing', status: EntityStatus.ACTIVE, sortOrder: 4 } }),
    prisma.topic.create({ data: { name: 'Employment', slug: 'employment', status: EntityStatus.ACTIVE, sortOrder: 5 } }),
    prisma.topic.create({ data: { name: 'Social Services', slug: 'social-services', status: EntityStatus.ACTIVE, sortOrder: 6 } }),
    prisma.topic.create({ data: { name: 'Community Integration', slug: 'community-integration', status: EntityStatus.ACTIVE, sortOrder: 7 } }),
  ]);

  const topicBySlug = new Map(topLevelTopics.map((topic) => [topic.slug, topic]));

  const traumaCounseling = await prisma.topic.create({
    data: {
      name: 'Trauma Counseling',
      slug: 'trauma-counseling',
      parentId: topicBySlug.get('healthcare')!.id,
      status: EntityStatus.ACTIVE,
      sortOrder: 1,
    },
  });
  topicBySlug.set(traumaCounseling.slug, traumaCounseling);

  const needsAssessment = await prisma.topic.create({
    data: {
      name: 'Case Management',
      slug: 'case-management',
      parentId: topicBySlug.get('social-services')!.id,
      status: EntityStatus.ACTIVE,
      sortOrder: 1,
    },
  });
  topicBySlug.set(needsAssessment.slug, needsAssessment);

  const createdNeedTags = await Promise.all([
    prisma.needTag.create({ data: { name: 'Urgent', slug: 'urgent', status: EntityStatus.ACTIVE } }),
    prisma.needTag.create({ data: { name: 'Housing', slug: 'housing', status: EntityStatus.ACTIVE } }),
    prisma.needTag.create({ data: { name: 'Legal', slug: 'legal', status: EntityStatus.ACTIVE } }),
    prisma.needTag.create({ data: { name: 'Medical', slug: 'medical', status: EntityStatus.ACTIVE } }),
    prisma.needTag.create({ data: { name: 'Employment', slug: 'employment', status: EntityStatus.ACTIVE } }),
    prisma.needTag.create({ data: { name: 'Documentation', slug: 'documentation', status: EntityStatus.ACTIVE } }),
  ]);
  const needTagBySlug = new Map(createdNeedTags.map((tag) => [tag.slug, tag]));

  const createdTargetGroups = await Promise.all([
    prisma.targetGroup.create({ data: { name: 'Women', status: EntityStatus.ACTIVE } }),
    prisma.targetGroup.create({ data: { name: 'Children', status: EntityStatus.ACTIVE } }),
    prisma.targetGroup.create({ data: { name: 'Older Persons', status: EntityStatus.ACTIVE } }),
    prisma.targetGroup.create({ data: { name: 'People with Disabilities', status: EntityStatus.ACTIVE } }),
    prisma.targetGroup.create({ data: { name: 'Single Parents', status: EntityStatus.ACTIVE } }),
    prisma.targetGroup.create({ data: { name: 'Youth', status: EntityStatus.ACTIVE } }),
  ]);
  const targetGroupByName = new Map(createdTargetGroups.map((group) => [group.name, group]));

  const servicesSeed = [
    {
      title: 'Legal Documentation Support Desk',
      shortDescription: 'Weekly legal orientation sessions for displaced families on residency and documentation.',
      description: 'Individual consultations for legal status, document renewal, and referral to legal aid lawyers.',
      organisationKey: 'mission-armenia',
      regionSlug: 'yerevan',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['legal-services', 'case-management'],
      targetGroups: ['Women', 'Single Parents'],
    },
    {
      title: 'Psychosocial Group Counseling',
      shortDescription: 'Structured psychosocial group sessions led by trained counselors.',
      description: 'Group and individual counseling focused on trauma, stress regulation, and social connection.',
      organisationKey: 'armenian-caritas',
      regionSlug: 'shirak',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['healthcare', 'trauma-counseling'],
      targetGroups: ['Women', 'Older Persons'],
    },
    {
      title: 'Emergency Rental Assistance',
      shortDescription: 'Short-term rental support for newly arrived displaced households.',
      description: 'Covers temporary rent and landlord mediation while families stabilize and access services.',
      organisationKey: 'people-in-need',
      regionSlug: 'lori',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['shelter-housing', 'social-services'],
      targetGroups: ['Single Parents', 'Children'],
    },
    {
      title: 'Assistive Devices Referral and Follow-up',
      shortDescription: 'Assessment and referral pathway for assistive devices and rehabilitation support.',
      description: 'Initial screening, specialist referral, and follow-up for wheelchair, hearing, and mobility support.',
      organisationKey: 'full-life',
      regionSlug: 'kotayk',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['healthcare', 'social-services'],
      targetGroups: ['People with Disabilities', 'Older Persons'],
    },
    {
      title: 'Job Readiness Workshops',
      shortDescription: 'CV building, interview prep, and job matching support for displaced adults.',
      description: 'Weekly cohort sessions with one-on-one coaching and referral to local employers.',
      organisationKey: 'people-in-need',
      regionSlug: 'lori',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['employment', 'community-integration'],
      targetGroups: ['Youth', 'Women'],
    },
    {
      title: 'Community Orientation for New Arrivals',
      shortDescription: 'Practical orientation on local services, schools, and health registration.',
      description: 'Facilitated orientation sessions with translation support for recently displaced families.',
      organisationKey: 'mission-armenia',
      regionSlug: 'yerevan',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['community-integration', 'case-management'],
      targetGroups: ['Children', 'Women'],
    },
  ];

  const createdServices: Awaited<ReturnType<typeof prisma.service.create>>[] = [];
  for (const service of servicesSeed) {
    const createdService = await prisma.service.create({
      data: {
        title: service.title,
        shortDescription: service.shortDescription,
        description: service.description,
        organisationId: getOrganisation(service.organisationKey).id,
        regionId: getRegion(service.regionSlug).id,
        status: service.status,
        isAvailable: service.isAvailable,
        topics: {
          create: service.topicSlugs.map((topicSlug) => ({
            topicId: topicBySlug.get(topicSlug)!.id,
          })),
        },
        targetGroups: {
          create: service.targetGroups.map((name) => ({
            targetGroupId: targetGroupByName.get(name)!.id,
          })),
        },
      },
    });

    createdServices.push(createdService);
  }

  const needsSeed = [
    {
      title: 'Family needs temporary housing and legal consultation',
      description: 'A family with two children needs emergency rental support and legal guidance for registration documents.',
      fullName: 'Suren Abrahamyan',
      contactMethod: 'PHONE',
      contactValue: '+37495550111',
      regionSlug: 'yerevan',
      status: NeedStatus.IN_PROGRESS,
      organisationKey: 'mission-armenia',
      tagSlugs: ['urgent', 'housing', 'legal', 'documentation'],
      assignedAdminEmail: 'org-admin@missionarmenia.org',
      comment: 'Initial call completed. Scheduling in-person assessment for tomorrow.',
    },
    {
      title: 'Older person needs medical referral and transport',
      description: 'An elderly person requires specialist referral and transportation support for follow-up treatment.',
      fullName: 'Hasmik Grigoryan',
      contactMethod: 'PHONE',
      contactValue: '+37493550222',
      regionSlug: 'kotayk',
      status: NeedStatus.NEW,
      organisationKey: 'full-life',
      tagSlugs: ['medical', 'urgent'],
      assignedAdminEmail: 'org-admin@fulllifearmenia.org',
      comment: 'Pending first outreach call.',
    },
    {
      title: 'Displaced single mother needs employment support',
      description: 'Client is looking for part-time employment and childcare-compatible work schedule.',
      fullName: 'Mane Petrosyan',
      contactMethod: 'EMAIL',
      contactValue: 'mane.client@example.com',
      regionSlug: 'lori',
      status: NeedStatus.IN_PROGRESS,
      organisationKey: 'people-in-need',
      tagSlugs: ['employment'],
      assignedAdminEmail: 'org-admin@peopleinneed.am',
      comment: 'Shared workshop calendar and requested CV draft.',
    },
  ];

  for (const need of needsSeed) {
    const createdNeed = await prisma.needReport.create({
      data: {
        title: need.title,
        description: need.description,
        fullName: need.fullName,
        contactMethod: need.contactMethod,
        contactValue: need.contactValue,
        regionId: getRegion(need.regionSlug).id,
        status: need.status,
        assignedOrganisationId: getOrganisation(need.organisationKey).id,
        tags: {
          create: need.tagSlugs.map((slug) => ({
            needTagId: needTagBySlug.get(slug)!.id,
          })),
        },
      },
    });

    const orgAdmin = userByEmail.get(need.assignedAdminEmail);
    if (!orgAdmin) throw new Error(`Missing user for email: ${need.assignedAdminEmail}`);

    await prisma.needReportEvent.createMany({
      data: [
        {
          needReportId: createdNeed.id,
          userId: adminUser.id,
          eventType: NeedReportEventType.ASSIGNED,
          content: 'Need was assigned to responding organisation.',
          metadata: { organisationId: getOrganisation(need.organisationKey).id },
        },
        {
          needReportId: createdNeed.id,
          userId: orgAdmin.id,
          eventType: NeedReportEventType.COMMENT,
          content: need.comment,
        },
      ],
    });

    await prisma.notification.createMany({
      data: [
        {
          userId: orgAdmin.id,
          type: NotificationType.NEED_ASSIGNED,
          title: 'Need report assigned',
          message: `Need \"${createdNeed.title}\" was assigned to your organisation.`,
          metadata: { needReportId: createdNeed.id },
        },
        {
          userId: adminUser.id,
          type: NotificationType.NEED_STATUS_CHANGED,
          title: 'Need status updated',
          message: `Need \"${createdNeed.title}\" is now ${createdNeed.status}.`,
          metadata: { needReportId: createdNeed.id },
        },
      ],
    });
  }

  await prisma.notification.createMany({
    data: createdServices.slice(0, 3).map((service) => ({
      userId: adminUser.id,
      type: NotificationType.SERVICE_PUBLISHED,
      title: 'Service published',
      message: `Service \"${service.title}\" was published successfully.`,
      metadata: { serviceId: service.id },
    })),
  });

  await prisma.searchLog.createMany({
    data: [
      {
        query: 'legal support for documents',
        regionId: getRegion('yerevan').id,
        topicIds: [topicBySlug.get('legal-services')!.id],
        resultsCount: 2,
      },
      {
        query: 'psychosocial counseling gyumri',
        regionId: getRegion('shirak').id,
        topicIds: [topicBySlug.get('trauma-counseling')!.id],
        resultsCount: 1,
      },
      {
        query: 'rental assistance vanadzor',
        regionId: getRegion('lori').id,
        topicIds: [topicBySlug.get('shelter-housing')!.id],
        resultsCount: 1,
      },
      {
        query: 'assistive devices support',
        regionId: getRegion('kotayk').id,
        topicIds: [topicBySlug.get('healthcare')!.id],
        resultsCount: 1,
      },
    ],
  });

  console.log('Seed completed with realistic Armenia-focused NGOs, services, needs, and activity data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
