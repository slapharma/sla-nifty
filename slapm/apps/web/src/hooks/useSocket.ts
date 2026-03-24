import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useSocket(): Socket {
  if (!socket) {
    const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? 'http://localhost:3001'
    socket = io(base, {
      auth: { token: localStorage.getItem('token') },
      autoConnect: true,
    })
  }
  return socket
}

export function useTaskSocket(taskId: string, onComment: (comment: unknown) => void) {
  const s = useSocket()
  const onCommentRef = useRef(onComment)
  onCommentRef.current = onComment

  useEffect(() => {
    const handler = (comment: unknown) => onCommentRef.current(comment)
    s.emit('task:join', taskId)
    s.on('comment:new', handler)
    return () => {
      s.emit('task:leave', taskId)
      s.off('comment:new', handler)
    }
  }, [taskId, s])
}
