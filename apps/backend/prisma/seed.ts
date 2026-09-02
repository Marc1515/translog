import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '../src/generated/prisma/client.js';

const supervisorEmail = process.env.SUPERVISOR_EMAIL;
const supervisorPassword = process.env.SUPERVISOR_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL es obligatoria para ejecutar el seed.');
}

if (!supervisorEmail || !supervisorPassword) {
  throw new Error(
    'SUPERVISOR_EMAIL y SUPERVISOR_PASSWORD son obligatorias para ejecutar el seed.',
  );
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(supervisorPassword, 10);

  await prisma.user.upsert({
    where: { email: supervisorEmail },
    update: {
      passwordHash,
      role: UserRole.SUPERVISOR,
    },
    create: {
      email: supervisorEmail,
      passwordHash,
      role: UserRole.SUPERVISOR,
    },
  });
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
