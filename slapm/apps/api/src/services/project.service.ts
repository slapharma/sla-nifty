import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
}

export async function createProject(userId: string, data: CreateProjectInput) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      color: data.color ?? '#3B82F6',
      members: {
        create: { userId, role: Role.ADMIN },
      },
    },
    include: {
      members: { include: { user: true } },
      _count: { select: { tasks: true } },
    },
  });
}

export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      archived: false,
      members: { some: { userId } },
    },
    include: {
      members: { include: { user: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProjectById(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      members: { some: { userId } },
    },
    include: {
      members: { include: { user: true } },
      milestones: { orderBy: { dueDate: 'asc' } },
      _count: { select: { tasks: true } },
    },
  });
}

export async function updateProject(
  projectId: string,
  data: Partial<{ name: string; description: string; color: string }>
) {
  return prisma.project.update({
    where: { id: projectId },
    data,
  });
}

export async function archiveProject(projectId: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: { archived: true },
  });
}

export async function addProjectMember(projectId: string, userId: string, role: Role = Role.MEMBER) {
  return prisma.projectMember.create({
    data: { projectId, userId, role },
    include: { user: true },
  });
}
