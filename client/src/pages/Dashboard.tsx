import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timersApi } from '@/api/timers'
import { starsApi } from '@/api/stars'
import { Navbar } from '@/components/layout/Navbar'
import { TimerCard } from '@/components/timer/TimerCard'
import { StarBadge } from '@/components/ui/StarBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Stars, TemplateType } from '@/types'

const TEMPLATE_KEYS: TemplateType[] = ['short', 'standard', 'hybrid', 'deep_work']

export function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: timersData, isLoading: timersLoading } = useQuery({
    queryKey: ['timers'],
    queryFn: () => timersApi.list().then((r) => r.data),
  })

  const { data: starsData } = useQuery({
    queryKey: ['stars'],
    queryFn: () => starsApi.list().then((r) => r.data),
  })

  const { mutate: deleteTimer, isPending: deleting } = useMutation({
    mutationFn: (id: string) => timersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timers'] })
      setDeleteId(null)
    },
  })

  const stars: Stars = starsData?.stars ?? { short: 0, standard: 0, hybrid: 0, deep_work: 0 }
  const hasStars = TEMPLATE_KEYS.some((k) => stars[k] > 0)
  const timers = timersData?.timers ?? []

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {hasStars && (
          <section className="mb-8">
            <h2 className="text-xs text-black uppercase tracking-wider mb-3">Your Stars</h2>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_KEYS.map((k) =>
                stars[k] > 0 ? <StarBadge key={k} templateType={k} count={stars[k]} /> : null
              )}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs text-black uppercase tracking-wider">Timers</h2>
            <Button size="sm" onClick={() => navigate('/create')}>
              + New Timer
            </Button>
          </div>

          {timersLoading ? (
            <p className="text-black text-sm animate-pulse">Loading...</p>
          ) : timers.length === 0 ? (
            <div className="border border-dashed border-black/20 rounded-lg p-12 text-center">
              <p className="text-black text-sm mb-4">No timers yet.</p>
              <Button onClick={() => navigate('/create')}>Create your first timer</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {timers.map((timer) => (
                <TimerCard
                  key={timer.id}
                  timer={timer}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete timer?"
      >
        <p className="text-black text-sm mb-6">
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={() => deleteId && deleteTimer(deleteId)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
