/**
 * localStorage-backed demo store.
 * Used when token === 'demo-admin' so the app is fully functional
 * without a running API server.
 */

import type { Project, Task, TaskStatus, TaskPriority } from '../types'

const DEMO_ADMIN_USER = {
  id: 'demo-admin',
  email: 'admin@slapharmagroup.com',
  name: 'Admin',
  role: 'ADMIN' as const,
  createdAt: new Date().toISOString(),
}

const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-demo-1',
    name: 'Drug Regulatory Submission',
    description: 'NDA submission package for SLA-001 compound',
    color: '#3b82f6',
    archived: false,
    members: [{ id: 'pm-1', userId: 'demo-admin', role: 'ADMIN', user: DEMO_ADMIN_USER }],
    _count: { tasks: 4 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-demo-2',
    name: 'Clinical Trial Phase II',
    description: 'Phase II trial coordination and documentation',
    color: '#8b5cf6',
    archived: false,
    members: [{ id: 'pm-2', userId: 'demo-admin', role: 'ADMIN', user: DEMO_ADMIN_USER }],
    _count: { tasks: 3 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const SEED_TASKS: Task[] = [
  {
    id: 'task-1', title: 'Prepare CMC section', status: 'TODO', priority: 'HIGH',
    position: 1000, projectId: 'proj-demo-1', tags: ['regulatory'], creator: DEMO_ADMIN_USER,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 86_400_000).toISOString(),
  },
  {
    id: 'task-2', title: 'Review preclinical data package', status: 'IN_PROGRESS', priority: 'URGENT',
    position: 1000, projectId: 'proj-demo-1', tags: ['review'], creator: DEMO_ADMIN_USER,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString(),
  },
  {
    id: 'task-3', title: 'Submit FDA cover letter', status: 'IN_REVIEW', priority: 'URGENT',
    position: 1000, projectId: 'proj-demo-1', tags: ['fda'], creator: DEMO_ADMIN_USER,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 86_400_000).toISOString(),
  },
  {
    id: 'task-4', title: 'Patent filing complete', status: 'DONE', priority: 'MEDIUM',
    position: 1000, projectId: 'proj-demo-1', tags: ['legal'], creator: DEMO_ADMIN_USER,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5', title: 'Enroll 50 trial participants', status: 'IN_PROGRESS', priority: 'HIGH',
    position: 1000, projectId: 'proj-demo-2', tags: ['enrollment'], creator: DEMO_ADMIN_USER,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 86_400_000).toISOString(),
  },
  {
    id: 'task-6', title: 'Set up data collection system', status: 'TODO', priority: 'MEDIUM',
    position: 2000, projectId: 'proj-demo-2', tags: ['infrastructure'], creator: DEMO_ADMIN_USER,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-7', title: 'IRB approval obtained', status: 'DONE', priority: 'HIGH',
    position: 1000, projectId: 'proj-demo-2', tags: ['compliance'], creator: DEMO_ADMIN_USER,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
]

function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

function load<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw) as T[]
  } catch {
    return seed
  }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data))
}

const PROJECTS_KEY = 'sla_demo_projects'
const TASKS_KEY = 'sla_demo_tasks'

export const demoStore = {
  // ── Projects ──────────────────────────────────────────
  getProjects(): Project[] {
    return load<Project>(PROJECTS_KEY, SEED_PROJECTS)
  },

  createProject(data: { name: string; description?: string; color?: string }): Project {
    const projects = this.getProjects()
    const project: Project = {
      id: `proj-${uid()}`,
      name: data.name,
      description: data.description,
      color: data.color ?? '#3b82f6',
      archived: false,
      members: [{ id: uid(), userId: 'demo-admin', role: 'ADMIN', user: DEMO_ADMIN_USER }],
      _count: { tasks: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    save(PROJECTS_KEY, [...projects, project])
    return project
  },

  // ── Tasks ─────────────────────────────────────────────
  getTasks(projectId: string): Task[] {
    return load<Task>(TASKS_KEY, SEED_TASKS).filter((t) => t.projectId === projectId)
  },

  createTask(data: Partial<Task> & { title: string; projectId: string }): Task {
    const all = load<Task>(TASKS_KEY, SEED_TASKS)
    const colTasks = all.filter((t) => t.projectId === data.projectId && t.status === (data.status ?? 'TODO'))
    const maxPos = colTasks.reduce((m, t) => Math.max(m, t.position), 0)
    const task: Task = {
      id: `task-${uid()}`,
      title: data.title,
      description: data.description,
      status: data.status ?? 'TODO',
      priority: data.priority ?? 'MEDIUM',
      position: maxPos + 1000,
      projectId: data.projectId,
      tags: data.tags ?? [],
      creator: DEMO_ADMIN_USER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: data.dueDate,
    }
    save(TASKS_KEY, [...all, task])
    // bump project task count
    const projects = this.getProjects()
    save(PROJECTS_KEY, projects.map((p) =>
      p.id === data.projectId ? { ...p, _count: { tasks: (p._count?.tasks ?? 0) + 1 } } : p
    ))
    return task
  },

  updateTask(taskId: string, updates: Partial<Task>): Task {
    const all = load<Task>(TASKS_KEY, SEED_TASKS)
    const updated = all.map((t) => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)
    save(TASKS_KEY, updated)
    return updated.find((t) => t.id === taskId)!
  },
}
