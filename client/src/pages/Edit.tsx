import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timersApi } from '@/api/timers'
import { Navbar } from '@/components/layout/Navbar'
import { BlockBuilder } from '@/components/timer/BlockBuilder'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { TemplateType } from '@/types'

export function Edit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [autoRestart, setAutoRestart] = useState(false)
  const [blocks, setBlocks] = useState<TemplateType[]>([])
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  const { data: timer, isLoading } = useQuery({
    queryKey: ['timers', id],
    queryFn: () => timersApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })

  // Initialize form from server data only once. The `initialized` flag prevents re-applying
  // server data on subsequent renders, which would overwrite any edits the user has made.
  useEffect(() => {
    if (timer && !initialized) {
      setTitle(timer.title)
      setDescription(timer.description ?? '')
      setAutoRestart(timer.autoRestart)
      setBlocks(timer.blocks)
      setInitialized(true)
    }
  }, [timer, initialized])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof timersApi.update>[1]) => timersApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timers'] })
      navigate('/dashboard')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? 'Failed to update timer')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Title is required'); return }
    if (blocks.length === 0) { setError('Add at least one block'); return }
    mutate({ title, description: description || undefined, autoRestart, blocks })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center mt-20">
          <p className="text-black animate-pulse text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="text-black hover:opacity-60 text-sm">
            ← Dashboard
          </button>
          <h1 className="text-black font-semibold text-lg">Edit Timer</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            id="description"
            label="Description (optional)"
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
              Save Changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
