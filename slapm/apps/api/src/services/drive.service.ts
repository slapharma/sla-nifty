import { google } from 'googleapis';

export function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}

export async function createProjectFolder(accessToken: string, projectName: string): Promise<string> {
  const drive = getDriveClient(accessToken);
  const res = await drive.files.create({
    requestBody: {
      name: `SLA - ${projectName}`,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });
  return res.data.id ?? '';
}

export async function uploadFile(
  accessToken: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<{ fileId: string; name: string; webViewLink: string }> {
  const drive = getDriveClient(accessToken);
  const { Readable } = await import('stream');
  const stream = Readable.from(buffer);

  const res = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType, body: stream },
    fields: 'id, name, webViewLink',
  });

  return {
    fileId: res.data.id ?? '',
    name: res.data.name ?? fileName,
    webViewLink: res.data.webViewLink ?? '',
  };
}

export async function listFolderFiles(accessToken: string, folderId: string) {
  const drive = getDriveClient(accessToken);
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webViewLink, size, modifiedTime)',
  });
  return res.data.files ?? [];
}
