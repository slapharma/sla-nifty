import { prisma } from '../config/prisma';
import { MilestoneStatus } from '@prisma/client';

export async function createMilestone(data: {
  title: string;
  projectId: string;
  dueDate: string;
  description?: string;
}) {
  return prisma.milestone.create({ data: { ...data, dueDate: new Date(data.dueDate) } });
}

export async function getProjectMilestones(projectId: string) {
  return prisma.milestone.findMany({
    where: { projectId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { dueDate: 'asc' },
  });
}

export async function updateMilestoneStatus(milestoneId: string, status: MilestoneStatus) {
  return prisma.milestone.update({ where: { id: milestoneId }, data: { status } });
}

export async function syncOverdueMilestones() {
  return prisma.milestone.updateMany({
    where: { dueDate: { lt: new Date() }, status: { in: ['PENDING', 'IN_PROGRESS'] } },
    data: { status: 'OVERDUE' },
  });
}
