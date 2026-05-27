import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { timersApi } from '@/api/timers'
import { Navbar } from '@/components/layout/Navbar'
import { BlockBuilder } from '@/components/timer/BlockBuilder'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { TemplateType } from '@/types'

export function Create() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [autoRestart, setAutoRestart] = useState(false)
  const [blocks, setBlocks] = useState<TemplateType[]>([])
  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: timersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timers'] })
      navigate('/dashboard')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? 'Failed to create timer')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Title is required'); return }
    if (blocks.length === 0) { setError('Add at least one block'); return }
    mutate({ title, description: description || undefined, autoRestart, blocks })
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="text-black hover:opacity-60 text-sm">
            ← Dashboard
          </button>
          <h1 className="text-black font-semibold text-lg">New Timer</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            id="title"
            label="Title"
            placeholder="Morning grind"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            id="description"
            label="Description (optional)"
            placeholder="Quick warmup before deep work"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <p className="text-xs text-black uppercase tracking-wider">Template Blocks</p>
            <div className="bg-white/30 border border-black/10 rounded-lg p-4">
              <BlockBuilder blocks={blocks} onChange={setBlocks} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setAutoRestart((v) => !v)}
              className={`w-10 h-5 rounded-full border transition-colors duration-200 relative ${
                autoRestart ? 'bg-black/25 border-black/25' : 'bg-white/30 border-black/10'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                autoRestart ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
            <span className="text-sm text-black">Auto-restart</span>
            <span className="text-xs text-black">loops until you stop it</span>
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Create Timer
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
