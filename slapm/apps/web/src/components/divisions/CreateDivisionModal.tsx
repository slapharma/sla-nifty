import { useState } from 'react'
import { useCreateDivision } from '../../hooks/useDivisions'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { X } from 'lucide-react'

const COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#64748b',
]

interface Props {
  onClose: () => void
}

export function CreateDivisionModal({ onClose }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [error, setError] = useState('')
  const createDivision = useCreateDivision()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    createDivision.mutate(
      { name: name.trim(), color },
      {
        onSuccess: onClose,
        onError: (err: any) => setError(err?.response?.data?.error ?? 'Failed to create division'),
      }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800 text-lg">New Division</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Division Name *</label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Research & Development"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Color</label>
            <div className="flex gap-2 mt-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={createDivision.isPending || !name.trim()} className="flex-1">
              {createDivision.isPending ? 'Creating…' : 'Create Division'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
