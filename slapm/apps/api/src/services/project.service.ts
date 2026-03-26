import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  divisionId?: string;
}

const PROJECT_INCLUDE = {
  members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
  division: { select: { id: true, name: true, color: true } },
  _count: { select: { tasks: true } },
} as const;

export async function createProject(userId: string, data: CreateProjectInput) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      color: data.color ?? '#3B82F6',
      divisionId: data.divisionId ?? null,
      members: { create: { userId, role: Role.ADMIN } },
    },
    include: PROJECT_INCLUDE,
  });
}

export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: { archived: false, members: { some: { userId } } },
    include: PROJECT_INCLUDE,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProjectById(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, members: { some: { userId } } },
    include: {
      ...PROJECT_INCLUDE,
      milestones: { orderBy: { dueDate: 'asc' } },
    },
  });
}

export async function updateProject(
  projectId: string,
  data: Partial<{ name: string; description: string; color: string; divisionId: string | null }>
) {
  return prisma.project.update({ where: { id: projectId }, data });
}

export async function archiveProject(projectId: string) {
  return prisma.project.update({ where: { id: projectId }, data: { archived: true } });
}

export async function addProjectMember(projectId: string, userId: string, role: Role = Role.MEMBER) {
  return prisma.projectMember.create({
    data: { projectId, userId, role },
    include: { user: true },
  });
}
