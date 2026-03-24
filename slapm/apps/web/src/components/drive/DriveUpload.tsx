import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Paperclip } from 'lucide-react'

interface Props {
  taskId: string
  projectId: string
}

export function DriveUpload({ taskId, projectId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const accessToken = localStorage.getItem('google_access_token') ?? ''
      const form = new FormData()
      form.append('file', file)
      form.append('accessToken', accessToken)
      return api.post(`/drive/tasks/${taskId}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  })

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) upload.mutate(f)
        }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={upload.isPending}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
      >
        <Paperclip size={14} />
        {upload.isPending ? 'Uploading…' : 'Attach file'}
      </button>
    </div>
  )
}
