import { Server, Socket } from 'socket.io';
import { verifyToken } from '../services/auth.service';

interface AuthSocket extends Socket {
  user?: ReturnType<typeof verifyToken>;
}

export function setupSocketIO(io: Server) {
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token as string;
    try {
      socket.user = verifyToken(token);
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    socket.on('task:join', (taskId: string) => socket.join(`task:${taskId}`));
    socket.on('task:leave', (taskId: string) => socket.leave(`task:${taskId}`));
    socket.on('project:join', (projectId: string) => socket.join(`project:${projectId}`));
  });
}
