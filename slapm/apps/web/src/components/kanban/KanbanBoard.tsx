import { useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { Task, TaskStatus } from '../../../types'
import { KanbanColumn } from './KanbanColumn'
import { useTasks, useUpdateTaskPosition } from '../../hooks/useTasks'

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

interface Props {
  projectId: string
  onTaskClick: (task: Task) => void
  onAddTask: (status: TaskStatus) => void
}

export function KanbanBoard({ projectId, onTaskClick, onAddTask }: Props) {
  const { data: tasks = [] } = useTasks(projectId)
  const updatePosition = useUpdateTaskPosition(projectId)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const getColumnTasks = useCallback(
    (status: TaskStatus) =>
      tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position),
    [tasks]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return

      const activeTask = tasks.find((t) => t.id === active.id)
      if (!activeTask) return

      const overStatus = STATUSES.includes(over.id as TaskStatus)
        ? (over.id as TaskStatus)
        : (tasks.find((t) => t.id === over.id)?.status ?? activeTask.status)

      const columnTasks = getColumnTasks(overStatus).filter((t) => t.id !== activeTask.id)
      const overIndex = columnTasks.findIndex((t) => t.id === over.id)

      let newPosition: number
      if (overIndex === -1 || columnTasks.length === 0) {
        newPosition = (columnTasks[columnTasks.length - 1]?.position ?? 0) + 1000
      } else if (overIndex === 0) {
        newPosition = columnTasks[0].position / 2
      } else {
        newPosition = (columnTasks[overIndex - 1].position + columnTasks[overIndex].position) / 2
      }

      updatePosition.mutate({ taskId: activeTask.id, position: newPosition, status: overStatus })
    },
    [tasks, getColumnTasks, updatePosition]
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-6 overflow-x-auto min-h-full">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={getColumnTasks(status)}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </DndContext>
  )
}
