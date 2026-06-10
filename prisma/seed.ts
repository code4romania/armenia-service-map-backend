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
  await prisma.subscription.deleteMany();
  await prisma.subscriber.deleteMany();
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
        email: 'org-member-pending@caritas.am',
        passwordHash,
        firstName: 'Narek',
        lastName: 'Stepanyan',
        phone: '+37431220004',
        role: Role.ORG_MEMBER,
        status: UserStatus.PENDING,
        organisationId: getOrganisation('armenian-caritas').id,
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

  type ServiceSeed = {
    title: string;
    titleHy: string;
    shortDescription: string;
    shortDescriptionHy: string;
    description: string;
    descriptionHy: string;
    howToAccess: string;
    howToAccessHy: string;
    // Exactly one of organisationKey (in-network) or externalOrganisationName (outside the network).
    organisationKey?: string;
    externalOrganisationName?: string;
    regionSlug: string;
    status: ServiceStatus;
    isAvailable: boolean;
    topicSlugs: string[];
    targetGroups: string[];
  };

  const servicesSeed: ServiceSeed[] = [
    {
      title: 'Legal Documentation Support Desk',
      titleHy: 'Իրավական փաստաթղթերի աջակցության կետ',
      shortDescription: 'Weekly legal orientation sessions for displaced families on residency and documentation.',
      shortDescriptionHy: 'Շաբաթական իրավական խորհրդատվություն տեղահանված ընտանիքների համար՝ բնակության և փաստաթղթերի հարցերով։',
      description: 'Individual consultations for legal status, document renewal, and referral to legal aid lawyers.',
      descriptionHy: 'Անհատական խորհրդատվություն իրավական կարգավիճակի, փաստաթղթերի թարմացման և իրավաբանների ուղղորդման համար։',
      howToAccess: 'Visit the desk in person on weekdays or call the contact number to book an appointment.',
      howToAccessHy: 'Այցելեք կետ աշխատանքային օրերին կամ զանգահարեք՝ հանդիպում ամրագրելու համար։',
      organisationKey: 'mission-armenia',
      regionSlug: 'yerevan',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['legal-services', 'case-management'],
      targetGroups: ['Women', 'Single Parents'],
    },
    {
      title: 'Psychosocial Group Counseling',
      titleHy: 'Հոգեսոցիալական խմբային խորհրդատվություն',
      shortDescription: 'Structured psychosocial group sessions led by trained counselors.',
      shortDescriptionHy: 'Կառուցվածքային հոգեսոցիալական խմբային հանդիպումներ՝ վերապատրաստված խորհրդատուների ղեկավարությամբ։',
      description: 'Group and individual counseling focused on trauma, stress regulation, and social connection.',
      descriptionHy: 'Խմբային և անհատական խորհրդատվություն՝ ուղղված տրավմայի, սթրեսի կարգավորման և սոցիալական կապի վերականգնմանը։',
      howToAccess: 'Register by phone or email; new groups start at the beginning of each month.',
      howToAccessHy: 'Գրանցվեք հեռախոսով կամ էլ. փոստով. նոր խմբերը մեկնարկում են ամսվա սկզբին։',
      organisationKey: 'armenian-caritas',
      regionSlug: 'shirak',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['healthcare', 'trauma-counseling'],
      targetGroups: ['Women', 'Older Persons'],
    },
    {
      title: 'Emergency Rental Assistance',
      titleHy: 'Վարձակալության շտապ աջակցություն',
      shortDescription: 'Short-term rental support for newly arrived displaced households.',
      shortDescriptionHy: 'Կարճաժամկետ վարձակալության աջակցություն նորեկ տեղահանված ընտանիքների համար։',
      description: 'Covers temporary rent and landlord mediation while families stabilize and access services.',
      descriptionHy: 'Ծածկում է ժամանակավոր վարձը և տանտիրոջ հետ միջնորդությունը՝ մինչ ընտանիքների կայունացումը։',
      howToAccess: 'Apply through a caseworker after an initial needs assessment.',
      howToAccessHy: 'Դիմեք սոցիալական աշխատողի միջոցով՝ կարիքների գնահատումից հետո։',
      organisationKey: 'people-in-need',
      regionSlug: 'lori',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['shelter-housing', 'social-services'],
      targetGroups: ['Single Parents', 'Children'],
    },
    {
      title: 'Assistive Devices Referral and Follow-up',
      titleHy: 'Օժանդակ սարքերի ուղղորդում և հետագա հսկողություն',
      shortDescription: 'Assessment and referral pathway for assistive devices and rehabilitation support.',
      shortDescriptionHy: 'Գնահատման և ուղղորդման ծառայություն՝ օժանդակ սարքերի և վերականգնողական աջակցության համար։',
      description: 'Initial screening, specialist referral, and follow-up for wheelchair, hearing, and mobility support.',
      descriptionHy: 'Սկզբնական զննում, մասնագետի ուղղորդում և հետագա հսկողություն՝ սայլակների, լսողության և շարժունակության աջակցության համար։',
      howToAccess: 'Request an assessment by phone; home visits can be arranged on a case-by-case basis.',
      howToAccessHy: 'Հայցեք գնահատում հեռախոսով. տնային այցերը կազմակերպվում են ըստ անհրաժեշտության։',
      organisationKey: 'full-life',
      regionSlug: 'kotayk',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['healthcare', 'social-services'],
      targetGroups: ['People with Disabilities', 'Older Persons'],
    },
    {
      title: 'Job Readiness Workshops',
      titleHy: 'Աշխատանքի պատրաստության դասընթացներ',
      shortDescription: 'CV building, interview prep, and job matching support for displaced adults.',
      shortDescriptionHy: 'Ինքնակենսագրականի կազմում, հարցազրույցի նախապատրաստում և աշխատանքի համապատասխանեցում տեղահանված մեծահասակների համար։',
      description: 'Weekly cohort sessions with one-on-one coaching and referral to local employers.',
      descriptionHy: 'Շաբաթական խմբային դասընթացներ՝ անհատական մենթորությամբ և տեղական գործատուների ուղղորդմամբ։',
      howToAccess: 'Sign up for the next cohort by email or at the local office.',
      howToAccessHy: 'Գրանցվեք հաջորդ խմբի համար էլ. փոստով կամ տեղական գրասենյակում։',
      organisationKey: 'people-in-need',
      regionSlug: 'lori',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['employment', 'community-integration'],
      targetGroups: ['Youth', 'Women'],
    },
    {
      title: 'Community Orientation for New Arrivals',
      titleHy: 'Համայնքային կողմնորոշում նորեկների համար',
      shortDescription: 'Practical orientation on local services, schools, and health registration.',
      shortDescriptionHy: 'Գործնական կողմնորոշում տեղական ծառայությունների, դպրոցների և առողջապահական գրանցման վերաբերյալ։',
      description: 'Facilitated orientation sessions with translation support for recently displaced families.',
      descriptionHy: 'Ուղեկցվող կողմնորոշման հանդիպումներ՝ թարգմանչական աջակցությամբ վերջերս տեղահանված ընտանիքների համար։',
      howToAccess: 'Join a weekly session; no appointment needed, walk-ins welcome.',
      howToAccessHy: 'Միացեք շաբաթական հանդիպմանը. նախնական գրանցում չի պահանջվում։',
      organisationKey: 'mission-armenia',
      regionSlug: 'yerevan',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['community-integration', 'case-management'],
      targetGroups: ['Children', 'Women'],
    },
    // --- Outside-the-network providers: named via externalOrganisationName, no linked Organisation ---
    {
      title: 'Primary Healthcare Mobile Clinic',
      titleHy: 'Առաջնային բուժօգնության շարժական կլինիկա',
      shortDescription: 'Mobile clinic offering basic health checks and medication for remote communities.',
      shortDescriptionHy: 'Շարժական կլինիկա՝ հիմնական առողջական ստուգումներով և դեղորայքով հեռավոր համայնքների համար։',
      description: 'Scheduled mobile visits providing primary consultations, vaccinations, and referrals.',
      descriptionHy: 'Պլանավորված շարժական այցեր՝ առաջնային խորհրդատվությամբ, պատվաստումներով և ուղղորդումներով։',
      howToAccess: 'Check the published visit schedule for your community; services are free of charge.',
      howToAccessHy: 'Ստուգեք ձեր համայնքի այցերի ժամանակացույցը. ծառայություններն անվճար են։',
      externalOrganisationName: 'UNHCR Armenia',
      regionSlug: 'gegharkunik',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['healthcare'],
      targetGroups: ['Older Persons', 'Children'],
    },
    {
      title: 'First Aid and Hygiene Distribution',
      titleHy: 'Առաջին օգնություն և հիգիենայի պարագաների բաշխում',
      shortDescription: 'Distribution of first-aid and hygiene kits with basic safety training.',
      shortDescriptionHy: 'Առաջին օգնության և հիգիենայի փաթեթների բաշխում՝ անվտանգության հիմնական ուսուցմամբ։',
      description: 'Regular distribution points provide essential supplies and short first-aid sessions.',
      descriptionHy: 'Կանոնավոր բաշխման կետերն ապահովում են անհրաժեշտ պարագաներ և կարճ առաջին օգնության դասընթացներ։',
      howToAccess: 'Visit a distribution point during opening hours with an ID document.',
      howToAccessHy: 'Այցելեք բաշխման կետ աշխատանքային ժամերին՝ անձը հաստատող փաստաթղթով։',
      externalOrganisationName: 'Armenian Red Cross Society',
      regionSlug: 'syunik',
      status: ServiceStatus.PUBLISHED,
      isAvailable: true,
      topicSlugs: ['social-services'],
      targetGroups: ['Women', 'Children'],
    },
  ];

  const createdServices: Awaited<ReturnType<typeof prisma.service.create>>[] = [];
  for (const service of servicesSeed) {
    // Enforce the organisation XOR invariant (mirrors ServicesService.assertOrganisationXor):
    // exactly one of an in-network organisation or an external organisation name.
    const hasOrg = Boolean(service.organisationKey);
    const hasExternal = Boolean(service.externalOrganisationName?.trim());
    if (hasOrg === hasExternal) {
      throw new Error(
        `Service "${service.title}" must have exactly one of organisationKey or externalOrganisationName`,
      );
    }

    const createdService = await prisma.service.create({
      data: {
        title: service.title,
        titleHy: service.titleHy,
        shortDescription: service.shortDescription,
        shortDescriptionHy: service.shortDescriptionHy,
        description: service.description,
        descriptionHy: service.descriptionHy,
        howToAccess: service.howToAccess,
        howToAccessHy: service.howToAccessHy,
        organisationId: service.organisationKey
          ? getOrganisation(service.organisationKey).id
          : null,
        externalOrganisationName: service.externalOrganisationName ?? null,
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

  const subscribersSeed = [
    {
      email: 'subscriber.hy@example.com',
      locale: 'hy',
      unsubscribeToken: 'seed-unsub-token-hy-001',
      subscriptions: [
        { regionSlug: 'yerevan', topicSlug: 'legal-services' },
        { regionSlug: 'yerevan', topicSlug: null },
      ],
    },
    {
      email: 'subscriber.en@example.com',
      locale: 'en',
      unsubscribeToken: 'seed-unsub-token-en-002',
      subscriptions: [{ regionSlug: 'lori', topicSlug: 'employment' }],
    },
    {
      email: 'subscriber.topic-only@example.com',
      locale: 'hy',
      unsubscribeToken: 'seed-unsub-token-hy-003',
      subscriptions: [{ regionSlug: null, topicSlug: 'healthcare' }],
    },
  ];

  for (const subscriber of subscribersSeed) {
    await prisma.subscriber.create({
      data: {
        email: subscriber.email,
        locale: subscriber.locale,
        unsubscribeToken: subscriber.unsubscribeToken,
        subscriptions: {
          create: subscriber.subscriptions.map((subscription) => ({
            regionId: subscription.regionSlug ? getRegion(subscription.regionSlug).id : null,
            topicId: subscription.topicSlug ? topicBySlug.get(subscription.topicSlug)!.id : null,
          })),
        },
      },
    });
  }

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
