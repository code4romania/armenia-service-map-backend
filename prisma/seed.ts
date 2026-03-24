import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../src/generated/prisma/client.js';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@refugeesupport.am' },
    update: {},
    create: {
      email: 'admin@refugeesupport.am',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
    },
  });

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

  for (const region of regions) {
    await prisma.region.upsert({
      where: { slug: region.slug },
      update: {},
      create: region,
    });
  }

  const topics = [
    { name: 'Health and Mental Health', slug: 'health-mental-health', sortOrder: 1 },
    { name: 'Basic needs and support', slug: 'basic-needs', sortOrder: 2 },
    { name: 'Employment', slug: 'employment', sortOrder: 3 },
    { name: 'Education and leadership', slug: 'education', sortOrder: 4 },
    { name: 'Legal advice', slug: 'legal-advice', sortOrder: 5 },
    { name: 'Shelter and housing', slug: 'shelter-housing', sortOrder: 6 },
    { name: 'LGBTQ+ Support', slug: 'lgbtq-support', sortOrder: 7 },
    { name: 'Food', slug: 'food', sortOrder: 8 },
    { name: 'Maternal and child support', slug: 'maternal-child', sortOrder: 9 },
    { name: 'Disability support', slug: 'disability', sortOrder: 10 },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {},
      create: topic,
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
