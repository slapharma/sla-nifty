import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('SLAAdmin2026!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@slapharmagroup.com' },
    update: {},
    create: {
      email: 'admin@slapharmagroup.com',
      name: 'SLA Admin',
      role: Role.ADMIN,
      passwordHash,
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'alice@slapharmagroup.com' },
    update: {},
    create: {
      email: 'alice@slapharmagroup.com',
      name: 'Alice Johnson',
      role: Role.MEMBER,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Drug Trial Q1 2026',
      description: 'Phase 2 clinical trial management for Q1',
      color: '#3B82F6',
      members: {
        create: [
          { userId: admin.id, role: Role.ADMIN },
          { userId: member1.id, role: Role.MEMBER },
        ],
      },
    },
  });

  const milestone = await prisma.milestone.create({
    data: {
      title: 'IRB Approval',
      dueDate: new Date('2026-04-30'),
      projectId: project.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Setup patient database schema',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        projectId: project.id,
        creatorId: admin.id,
        position: 1000,
        tags: ['database', 'setup'],
      },
      {
        title: 'Prepare IRB documentation',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: member1.id,
        milestoneId: milestone.id,
        dueDate: new Date('2026-04-15'),
        position: 2000,
        tags: ['compliance', 'documentation'],
      },
      {
        title: 'Recruit trial participants',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: project.id,
        creatorId: admin.id,
        dueDate: new Date('2026-05-01'),
        position: 3000,
        tags: ['recruitment'],
      },
      {
        title: 'Design data collection protocol',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: project.id,
        creatorId: admin.id,
        position: 4000,
      },
    ],
  });

  console.log('Seed complete.');
  console.log(`  Created project: ${project.name}`);
  console.log(`  Created 2 users, 4 tasks, 1 milestone`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
