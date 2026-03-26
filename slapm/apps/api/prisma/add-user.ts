import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('clifton2026!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'clifton@slapharma.com' },
    update: { passwordHash, name: 'Clifton' },
    create: {
      email: 'clifton@slapharma.com',
      name: 'Clifton',
      role: Role.ADMIN,
      passwordHash,
    },
  });
  console.log('User upserted:', user.email, user.id);

  // Add to all existing projects as ADMIN
  const projects = await prisma.project.findMany({ where: { archived: false } });
  for (const project of projects) {
    await prisma.projectMember.upsert({
      where: { userId_projectId: { userId: user.id, projectId: project.id } },
      update: {},
      create: { userId: user.id, projectId: project.id, role: Role.ADMIN },
    });
    console.log(`Added to project: ${project.name}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
