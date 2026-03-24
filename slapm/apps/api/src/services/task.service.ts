import { prisma } from '../config/prisma';
import { TaskStatus, TaskPriority } from '@prisma/client';

interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  milestoneId?: string;
  parentId?: string;
  tags?: string[];
}

export async function createTask(creatorId: string, data: CreateTaskInput) {
  // Position new tasks at the bottom of TODO column
  const lastTask = await prisma.task.findFirst({
    where: { projectId: data.projectId, status: 'TODO' },
    orderBy: { position: 'desc' },
  });
  const position = (lastTask?.position ?? 0) + 1000;

  return prisma.task.create({
    data: {
      ...data,
      creatorId,
      position,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      tags: data.tags ?? [],
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      milestone: true,
      _count: { select: { comments: true, subtasks: true } },
    },
  });
}

export async function getProjectTasks(projectId: string) {
  return prisma.task.findMany({
    where: { projectId, parentId: null },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      milestone: { select: { id: true, title: true, status: true } },
      subtasks: { select: { id: true, title: true, status: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
  });
}

export async function updateTask(
  taskId: string,
  data: Partial<CreateTaskInput & { status: TaskStatus; completedAt: Date | null }>
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }
  return prisma.task.update({ where: { id: taskId }, data: updateData });
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  return prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === TaskStatus.DONE ? new Date() : null,
    },
  });
}

export async function updateTaskPosition(taskId: string, position: number, status: TaskStatus) {
  return prisma.task.update({
    where: { id: taskId },
    data: { position, status },
  });
}

export async function deleteTask(taskId: string) {
  return prisma.task.delete({ where: { id: taskId } });
}

export async function assertProjectMember(userId: string, projectId: string): Promise<void> {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!member) {
    const error = new Error('Forbidden') as Error & { status: number };
    error.status = 403;
    throw error;
  }
}
