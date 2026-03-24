export type Role = 'ADMIN' | 'MEMBER' | 'VIEWER'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: Role
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  archived: boolean
  members: ProjectMember[]
  _count?: { tasks: number }
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: string
  userId: string
  role: Role
  user: User
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  position: number
  dueDate?: string
  completedAt?: string
  projectId: string
  assignee?: User
  creator: User
  milestoneId?: string
  milestone?: Milestone
  parentId?: string
  subtasks?: Task[]
  tags: string[]
  driveFiles?: DriveFile[]
  _count?: { comments: number }
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  title: string
  description?: string
  dueDate: string
  status: MilestoneStatus
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  body: string
  taskId: string
  author: User
  parentId?: string
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface DriveFile {
  fileId: string
  name: string
  webViewLink: string
}

export interface ActivityLog {
  id: string
  action: string
  meta?: Record<string, unknown>
  taskId?: string
  userId: string
  user: User
  createdAt: string
}
