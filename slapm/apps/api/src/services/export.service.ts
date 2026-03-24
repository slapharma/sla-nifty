import { prisma } from '../config/prisma';
import { stringify } from 'csv-stringify/sync';
import PDFDocument from 'pdfkit';

export async function exportTasksCSV(projectId: string): Promise<string> {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: { assignee: true, milestone: true },
    orderBy: { status: 'asc' },
  });

  return stringify(
    tasks.map((t) => ({
      ID: t.id,
      Title: t.title,
      Status: t.status,
      Priority: t.priority,
      Assignee: t.assignee?.name ?? '',
      'Due Date': t.dueDate?.toISOString().split('T')[0] ?? '',
      Milestone: t.milestone?.title ?? '',
      'Created At': t.createdAt.toISOString().split('T')[0],
    })),
    { header: true }
  );
}

export function generateTasksPDF(
  projectName: string,
  tasks: Array<{
    title: string;
    status: string;
    priority: string;
    assignee?: { name: string } | null;
    dueDate?: Date | null;
  }>
): Buffer {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  doc.fontSize(20).fillColor('#1e293b').text(`${projectName} — Task Report`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).fillColor('#64748b').text(`Generated: ${new Date().toLocaleDateString()}`);
  doc.moveDown(2);

  tasks.forEach((task, i) => {
    doc.fontSize(11).fillColor('#1e293b').text(`${i + 1}. ${task.title}`);
    doc
      .fontSize(9)
      .fillColor('#64748b')
      .text(
        `   Status: ${task.status}  |  Priority: ${task.priority}  |  Assignee: ${
          task.assignee?.name ?? 'Unassigned'
        }  |  Due: ${task.dueDate?.toLocaleDateString() ?? 'None'}`
      );
    doc.moveDown(0.5);
  });

  doc.end();
  return Buffer.concat(chunks);
}
